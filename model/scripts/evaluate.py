#!/usr/bin/env python3
"""
영수증 분석 모델 평가 스크립트

금액 및 날짜 추출 정확도를 측정합니다.

사용법:
    python evaluate.py --model_path ./output/qwen3-vl-2b-receipt --test_data ./data/processed/test.json
"""

import argparse
import json
import re
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import torch
from PIL import Image
from tqdm import tqdm
from transformers import AutoModelForVision2Seq, AutoProcessor


@dataclass
class EvaluationMetrics:
    """평가 메트릭"""
    total_samples: int = 0

    # 금액 관련
    amount_correct: int = 0
    amount_total: int = 0
    amount_mae: float = 0.0  # Mean Absolute Error

    # 날짜 관련
    date_correct: int = 0
    date_total: int = 0

    # 응답 시간
    total_inference_time: float = 0.0

    @property
    def amount_accuracy(self) -> float:
        return self.amount_correct / self.amount_total if self.amount_total > 0 else 0.0

    @property
    def date_accuracy(self) -> float:
        return self.date_correct / self.date_total if self.date_total > 0 else 0.0

    @property
    def avg_inference_time(self) -> float:
        return self.total_inference_time / self.total_samples if self.total_samples > 0 else 0.0

    def to_dict(self) -> dict:
        return {
            "total_samples": self.total_samples,
            "amount": {
                "accuracy": f"{self.amount_accuracy:.2%}",
                "correct": self.amount_correct,
                "total": self.amount_total,
                "mae": f"{self.amount_mae:.2f}"
            },
            "date": {
                "accuracy": f"{self.date_accuracy:.2%}",
                "correct": self.date_correct,
                "total": self.date_total
            },
            "performance": {
                "avg_inference_time_sec": f"{self.avg_inference_time:.3f}",
                "total_inference_time_sec": f"{self.total_inference_time:.2f}"
            }
        }


def load_model(model_path: str, device: str = "cuda"):
    """모델 및 프로세서 로드"""
    processor = AutoProcessor.from_pretrained(model_path, trust_remote_code=True)
    model = AutoModelForVision2Seq.from_pretrained(
        model_path,
        torch_dtype=torch.bfloat16,
        trust_remote_code=True,
        device_map="auto" if device == "cuda" else None,
    )

    if device == "cuda":
        model = model.cuda()

    model.eval()
    return model, processor


def load_test_data(test_path: str, image_dir: str) -> list[dict]:
    """테스트 데이터 로드"""
    with open(test_path, encoding="utf-8") as f:
        data = json.load(f)

    # 이미지 경로 추가 및 ground truth 추출
    processed = []
    for item in data:
        image_name = item.get("image", "")
        image_path = Path(image_dir) / image_name

        if not image_path.exists():
            print(f"Warning: Image not found: {image_path}")
            continue

        # Ground truth 추출 (assistant 응답에서)
        gt = {"amount": None, "date": None}
        for conv in item.get("conversations", []):
            if conv.get("role") == "assistant":
                try:
                    gt = json.loads(conv.get("content", "{}"))
                except json.JSONDecodeError:
                    pass

        processed.append({
            "image_path": str(image_path),
            "image_name": image_name,
            "ground_truth": gt
        })

    return processed


def extract_json_from_response(response: str) -> dict:
    """모델 응답에서 JSON 추출"""
    # JSON 블록 찾기
    json_match = re.search(r'\{[^{}]*\}', response)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    # 수동 파싱 시도
    result = {"amount": None, "date": None, "currency": None}

    # 금액 추출
    amount_match = re.search(r'"?amount"?\s*[:\s]\s*([0-9,.]+)', response, re.IGNORECASE)
    if amount_match:
        try:
            result["amount"] = float(amount_match.group(1).replace(",", ""))
        except ValueError:
            pass

    # 날짜 추출
    date_match = re.search(r'"?date"?\s*[:\s]\s*"?(\d{4}-\d{2}-\d{2})"?', response, re.IGNORECASE)
    if date_match:
        result["date"] = date_match.group(1)

    return result


def compare_amounts(pred: float | None, gt: float | None, tolerance: float = 0.01) -> tuple[bool, float]:
    """금액 비교 (허용 오차 내에서)"""
    if pred is None or gt is None:
        return False, float('inf')

    diff = abs(pred - gt)
    # 상대 오차 또는 절대 오차 허용
    is_correct = diff <= tolerance * gt or diff <= 1.0
    return is_correct, diff


def compare_dates(pred: str | None, gt: str | None) -> bool:
    """날짜 비교"""
    if pred is None or gt is None:
        return False

    try:
        pred_date = datetime.strptime(pred, "%Y-%m-%d")
        gt_date = datetime.strptime(gt, "%Y-%m-%d")
        return pred_date == gt_date
    except ValueError:
        return pred == gt


def run_inference(model, processor, image_path: str, device: str = "cuda") -> tuple[str, float]:
    """단일 이미지에 대해 추론 실행"""
    image = Image.open(image_path).convert("RGB")

    prompt = "<|im_start|>user\n<image>\n이 영수증에서 총 금액과 날짜를 추출해주세요.<|im_end|>\n<|im_start|>assistant\n"

    inputs = processor(
        text=prompt,
        images=image,
        return_tensors="pt",
    )

    if device == "cuda":
        inputs = {k: v.cuda() for k, v in inputs.items()}

    start_time = time.time()

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=256,
            do_sample=False,
            pad_token_id=processor.tokenizer.pad_token_id,
        )

    inference_time = time.time() - start_time

    response = processor.decode(outputs[0], skip_special_tokens=True)

    # Assistant 응답 부분만 추출
    if "<|im_start|>assistant" in response:
        response = response.split("<|im_start|>assistant")[-1]

    return response.strip(), inference_time


def evaluate(
    model_path: str,
    test_path: str,
    image_dir: str,
    output_path: str | None = None,
    device: str = "cuda",
    max_samples: int | None = None
):
    """전체 평가 실행"""
    print("=" * 60)
    print("Receipt Analysis Model Evaluation")
    print("=" * 60)
    print(f"Model: {model_path}")
    print(f"Test data: {test_path}")
    print("=" * 60)

    # 모델 로드
    print("\n[1/3] Loading model...")
    model, processor = load_model(model_path, device)

    # 테스트 데이터 로드
    print("[2/3] Loading test data...")
    test_data = load_test_data(test_path, image_dir)

    if max_samples:
        test_data = test_data[:max_samples]

    print(f"Test samples: {len(test_data)}")

    # 평가 실행
    print("\n[3/3] Running evaluation...")
    metrics = EvaluationMetrics()
    results = []
    amount_errors = []

    for item in tqdm(test_data, desc="Evaluating"):
        metrics.total_samples += 1

        # 추론
        response, inference_time = run_inference(
            model, processor, item["image_path"], device
        )
        metrics.total_inference_time += inference_time

        # 예측 결과 파싱
        prediction = extract_json_from_response(response)
        gt = item["ground_truth"]

        # 금액 비교
        if gt.get("amount") is not None:
            metrics.amount_total += 1
            is_correct, error = compare_amounts(
                prediction.get("amount"),
                gt.get("amount")
            )
            if is_correct:
                metrics.amount_correct += 1
            if error != float('inf'):
                amount_errors.append(error)

        # 날짜 비교
        if gt.get("date") is not None:
            metrics.date_total += 1
            if compare_dates(prediction.get("date"), gt.get("date")):
                metrics.date_correct += 1

        # 결과 저장
        results.append({
            "image": item["image_name"],
            "ground_truth": gt,
            "prediction": prediction,
            "raw_response": response,
            "inference_time": inference_time
        })

    # MAE 계산
    if amount_errors:
        metrics.amount_mae = sum(amount_errors) / len(amount_errors)

    # 결과 출력
    print("\n" + "=" * 60)
    print("Evaluation Results")
    print("=" * 60)

    metrics_dict = metrics.to_dict()
    print(f"\nTotal Samples: {metrics_dict['total_samples']}")

    print(f"\nAmount Extraction:")
    print(f"  Accuracy: {metrics_dict['amount']['accuracy']}")
    print(f"  Correct: {metrics_dict['amount']['correct']}/{metrics_dict['amount']['total']}")
    print(f"  MAE: {metrics_dict['amount']['mae']}")

    print(f"\nDate Extraction:")
    print(f"  Accuracy: {metrics_dict['date']['accuracy']}")
    print(f"  Correct: {metrics_dict['date']['correct']}/{metrics_dict['date']['total']}")

    print(f"\nPerformance:")
    print(f"  Avg Inference Time: {metrics_dict['performance']['avg_inference_time_sec']}s")
    print(f"  Total Time: {metrics_dict['performance']['total_inference_time_sec']}s")

    # 목표 달성 여부
    print("\n" + "=" * 60)
    print("Target Achievement")
    print("=" * 60)

    amount_target = 0.90
    date_target = 0.85
    time_target = 3.0

    print(f"Amount Accuracy: {'✓' if metrics.amount_accuracy >= amount_target else '✗'} "
          f"({metrics.amount_accuracy:.1%} / {amount_target:.0%} target)")
    print(f"Date Accuracy: {'✓' if metrics.date_accuracy >= date_target else '✗'} "
          f"({metrics.date_accuracy:.1%} / {date_target:.0%} target)")
    print(f"Inference Time: {'✓' if metrics.avg_inference_time <= time_target else '✗'} "
          f"({metrics.avg_inference_time:.2f}s / {time_target:.0f}s target)")

    # 결과 저장
    if output_path:
        output = {
            "metrics": metrics_dict,
            "results": results
        }
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"\nResults saved to: {output_path}")

    return metrics


def main():
    parser = argparse.ArgumentParser(description="영수증 분석 모델 평가")
    parser.add_argument(
        "--model_path",
        type=str,
        required=True,
        help="모델 경로"
    )
    parser.add_argument(
        "--test_data",
        type=str,
        default="./data/processed/test.json",
        help="테스트 데이터 경로"
    )
    parser.add_argument(
        "--image_dir",
        type=str,
        default="./data/processed/images",
        help="이미지 디렉토리"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="./output/evaluation_results.json",
        help="결과 저장 경로"
    )
    parser.add_argument(
        "--device",
        type=str,
        default="cuda",
        choices=["cuda", "cpu"],
        help="실행 디바이스"
    )
    parser.add_argument(
        "--max_samples",
        type=int,
        default=None,
        help="최대 평가 샘플 수 (테스트용)"
    )

    args = parser.parse_args()

    evaluate(
        model_path=args.model_path,
        test_path=args.test_data,
        image_dir=args.image_dir,
        output_path=args.output,
        device=args.device,
        max_samples=args.max_samples
    )


if __name__ == "__main__":
    main()
