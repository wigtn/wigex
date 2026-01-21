#!/usr/bin/env python3
"""
영수증 데이터셋 전처리 스크립트

공개 데이터셋 (SROIE, CORD, ICDAR)을 Qwen VL 학습용 형식으로 변환합니다.

사용법:
    python prepare_dataset.py --source sroie --data_dir ./data/raw/sroie --output_dir ./data/processed
"""

import argparse
import json
import os
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from PIL import Image
from sklearn.model_selection import train_test_split
from tqdm import tqdm


def parse_sroie_annotation(txt_path: Path) -> dict[str, Any]:
    """
    SROIE 데이터셋 어노테이션 파싱

    SROIE 형식:
    - 각 영수증에 대해 .txt 파일에 키-값 쌍으로 정보 저장
    - company, date, address, total 필드 포함
    """
    result = {"amount": None, "date": None, "currency": "MYR"}  # SROIE는 말레이시아 링깃

    with open(txt_path, encoding="utf-8") as f:
        content = f.read()

    # Total 금액 추출
    total_match = re.search(r"total[:\s]*([0-9.,]+)", content, re.IGNORECASE)
    if total_match:
        amount_str = total_match.group(1).replace(",", "")
        try:
            result["amount"] = float(amount_str)
        except ValueError:
            pass

    # 날짜 추출 (다양한 형식 지원)
    date_patterns = [
        r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
        r"(\d{4}[/-]\d{1,2}[/-]\d{1,2})",
        r"(\d{1,2}\s+\w+\s+\d{4})",
    ]

    for pattern in date_patterns:
        date_match = re.search(pattern, content)
        if date_match:
            date_str = date_match.group(1)
            result["date"] = normalize_date(date_str)
            if result["date"]:
                break

    return result


def parse_cord_annotation(json_path: Path) -> dict[str, Any]:
    """
    CORD 데이터셋 어노테이션 파싱

    CORD 형식:
    - JSON 형식으로 구조화된 정보
    - menu, total, sub_total 등의 필드 포함
    """
    result = {"amount": None, "date": None, "currency": "KRW"}  # CORD는 한국 원화

    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    # valid_line에서 정보 추출
    if "valid_line" in data:
        for item in data["valid_line"]:
            words = item.get("words", [])
            category = item.get("category", "")

            # Total 금액
            if "total" in category.lower():
                for word in words:
                    text = word.get("text", "")
                    if text.replace(",", "").replace(".", "").isdigit():
                        try:
                            result["amount"] = float(text.replace(",", ""))
                        except ValueError:
                            pass

            # 날짜
            if "date" in category.lower():
                for word in words:
                    date_str = word.get("text", "")
                    result["date"] = normalize_date(date_str)

    return result


def normalize_date(date_str: str) -> str | None:
    """날짜 문자열을 YYYY-MM-DD 형식으로 정규화"""
    date_formats = [
        "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d",
        "%d-%m-%Y", "%m-%d-%Y", "%Y-%m-%d",
        "%d.%m.%Y", "%Y.%m.%d",
        "%d %b %Y", "%d %B %Y",
        "%Y%m%d",
    ]

    for fmt in date_formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    return None


def create_conversation(image_name: str, annotation: dict[str, Any]) -> dict[str, Any]:
    """Qwen VL 학습용 대화 형식으로 변환"""

    # 응답 JSON 생성
    response = {
        "amount": annotation.get("amount"),
        "date": annotation.get("date"),
        "currency": annotation.get("currency", "KRW")
    }

    return {
        "image": image_name,
        "conversations": [
            {
                "role": "user",
                "content": "<image>\n이 영수증에서 총 금액과 날짜를 추출해주세요."
            },
            {
                "role": "assistant",
                "content": json.dumps(response, ensure_ascii=False)
            }
        ]
    }


def process_sroie_dataset(data_dir: Path, output_dir: Path) -> list[dict]:
    """SROIE 데이터셋 처리"""
    samples = []

    # SROIE 구조: data_dir/img/*.jpg, data_dir/box/*.txt
    img_dir = data_dir / "img"
    box_dir = data_dir / "box"

    if not img_dir.exists():
        # 대안 구조: 같은 폴더에 이미지와 txt
        img_files = list(data_dir.glob("*.jpg")) + list(data_dir.glob("*.png"))
        for img_path in tqdm(img_files, desc="Processing SROIE"):
            txt_path = img_path.with_suffix(".txt")
            if txt_path.exists():
                annotation = parse_sroie_annotation(txt_path)
                if annotation["amount"] or annotation["date"]:
                    # 이미지 복사
                    dest_img = output_dir / "images" / img_path.name
                    dest_img.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy(img_path, dest_img)

                    sample = create_conversation(img_path.name, annotation)
                    samples.append(sample)
    else:
        for img_path in tqdm(list(img_dir.glob("*")), desc="Processing SROIE"):
            txt_path = box_dir / f"{img_path.stem}.txt"
            if txt_path.exists():
                annotation = parse_sroie_annotation(txt_path)
                if annotation["amount"] or annotation["date"]:
                    dest_img = output_dir / "images" / img_path.name
                    dest_img.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy(img_path, dest_img)

                    sample = create_conversation(img_path.name, annotation)
                    samples.append(sample)

    return samples


def process_cord_dataset(data_dir: Path, output_dir: Path) -> list[dict]:
    """CORD 데이터셋 처리"""
    samples = []

    # CORD 구조: data_dir/image/*.png, data_dir/json/*.json
    img_dir = data_dir / "image"
    json_dir = data_dir / "json"

    if not img_dir.exists():
        print(f"Warning: CORD image directory not found: {img_dir}")
        return samples

    for img_path in tqdm(list(img_dir.glob("*")), desc="Processing CORD"):
        json_path = json_dir / f"{img_path.stem}.json"
        if json_path.exists():
            annotation = parse_cord_annotation(json_path)
            if annotation["amount"] or annotation["date"]:
                dest_img = output_dir / "images" / img_path.name
                dest_img.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy(img_path, dest_img)

                sample = create_conversation(img_path.name, annotation)
                samples.append(sample)

    return samples


def process_custom_dataset(data_dir: Path, output_dir: Path) -> list[dict]:
    """
    커스텀 데이터셋 처리

    예상 구조:
    data_dir/
        images/
            receipt_001.jpg
            receipt_002.jpg
        annotations.json (전체 어노테이션)

    annotations.json 형식:
    [
        {
            "image": "receipt_001.jpg",
            "amount": 15000,
            "date": "2025-01-15",
            "currency": "KRW"
        },
        ...
    ]
    """
    samples = []

    annotations_path = data_dir / "annotations.json"
    if not annotations_path.exists():
        print(f"Warning: annotations.json not found in {data_dir}")
        return samples

    with open(annotations_path, encoding="utf-8") as f:
        annotations = json.load(f)

    img_dir = data_dir / "images"

    for ann in tqdm(annotations, desc="Processing custom dataset"):
        img_name = ann.get("image")
        img_path = img_dir / img_name

        if img_path.exists():
            dest_img = output_dir / "images" / img_name
            dest_img.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(img_path, dest_img)

            sample = create_conversation(img_name, ann)
            samples.append(sample)

    return samples


def validate_image(img_path: Path, min_size: int = 100) -> bool:
    """이미지 유효성 검증"""
    try:
        with Image.open(img_path) as img:
            w, h = img.size
            return w >= min_size and h >= min_size
    except Exception:
        return False


def split_dataset(
    samples: list[dict],
    train_ratio: float = 0.8,
    eval_ratio: float = 0.1,
    test_ratio: float = 0.1,
    random_state: int = 42
) -> tuple[list, list, list]:
    """데이터셋 분할"""
    assert abs(train_ratio + eval_ratio + test_ratio - 1.0) < 0.001

    # 먼저 train과 나머지로 분할
    train_samples, temp_samples = train_test_split(
        samples,
        train_size=train_ratio,
        random_state=random_state
    )

    # 나머지를 eval과 test로 분할
    relative_test_ratio = test_ratio / (eval_ratio + test_ratio)
    eval_samples, test_samples = train_test_split(
        temp_samples,
        test_size=relative_test_ratio,
        random_state=random_state
    )

    return train_samples, eval_samples, test_samples


def save_dataset(samples: list[dict], output_path: Path):
    """데이터셋 JSON 파일로 저장"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(samples, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(samples)} samples to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="영수증 데이터셋 전처리")
    parser.add_argument(
        "--source",
        type=str,
        choices=["sroie", "cord", "custom"],
        required=True,
        help="데이터셋 소스"
    )
    parser.add_argument(
        "--data_dir",
        type=str,
        required=True,
        help="원본 데이터 디렉토리"
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default="./data/processed",
        help="출력 디렉토리"
    )
    parser.add_argument(
        "--train_ratio",
        type=float,
        default=0.8,
        help="학습 데이터 비율"
    )
    parser.add_argument(
        "--eval_ratio",
        type=float,
        default=0.1,
        help="검증 데이터 비율"
    )
    parser.add_argument(
        "--test_ratio",
        type=float,
        default=0.1,
        help="테스트 데이터 비율"
    )

    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    output_dir = Path(args.output_dir)

    # 데이터셋 처리
    print(f"Processing {args.source} dataset from {data_dir}")

    if args.source == "sroie":
        samples = process_sroie_dataset(data_dir, output_dir)
    elif args.source == "cord":
        samples = process_cord_dataset(data_dir, output_dir)
    else:
        samples = process_custom_dataset(data_dir, output_dir)

    if not samples:
        print("Error: No valid samples found!")
        return

    print(f"Total samples: {len(samples)}")

    # 데이터셋 분할
    train_samples, eval_samples, test_samples = split_dataset(
        samples,
        args.train_ratio,
        args.eval_ratio,
        args.test_ratio
    )

    # 저장
    save_dataset(train_samples, output_dir / "train.json")
    save_dataset(eval_samples, output_dir / "eval.json")
    save_dataset(test_samples, output_dir / "test.json")

    # 통계 출력
    print("\n=== Dataset Statistics ===")
    print(f"Train: {len(train_samples)} samples")
    print(f"Eval: {len(eval_samples)} samples")
    print(f"Test: {len(test_samples)} samples")

    # 샘플 출력
    if train_samples:
        print("\n=== Sample Entry ===")
        print(json.dumps(train_samples[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
