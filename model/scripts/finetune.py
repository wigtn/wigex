#!/usr/bin/env python3
"""
Qwen3-VL-2B 영수증 분석 파인튜닝 스크립트

LoRA를 사용한 메모리 효율적인 파인튜닝을 수행합니다.

사용법:
    python finetune.py --config ../configs/finetune_config.yaml
"""

import argparse
import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import torch
import yaml
from datasets import Dataset
from PIL import Image
from peft import LoraConfig, TaskType, get_peft_model, prepare_model_for_kbit_training
from transformers import (
    AutoModelForVision2Seq,
    AutoProcessor,
    BitsAndBytesConfig,
    Trainer,
    TrainingArguments,
)


@dataclass
class ReceiptDataCollator:
    """영수증 데이터용 Data Collator"""
    processor: Any
    max_length: int = 4096

    def __call__(self, examples: list[dict]) -> dict:
        texts = []
        images = []

        for example in examples:
            # 이미지 로드
            image_path = example.get("image_path")
            if image_path and Path(image_path).exists():
                image = Image.open(image_path).convert("RGB")
                images.append(image)
            else:
                # 더미 이미지 (에러 방지)
                images.append(Image.new("RGB", (448, 448), color="white"))

            # 대화 형식 텍스트 생성
            conversations = example.get("conversations", [])
            text = self._format_conversation(conversations)
            texts.append(text)

        # 프로세서로 배치 처리
        batch = self.processor(
            text=texts,
            images=images,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=self.max_length,
        )

        # Labels 설정 (input_ids와 동일, padding은 -100)
        labels = batch["input_ids"].clone()
        labels[labels == self.processor.tokenizer.pad_token_id] = -100
        batch["labels"] = labels

        return batch

    def _format_conversation(self, conversations: list[dict]) -> str:
        """대화를 Qwen 형식으로 포맷팅"""
        formatted = ""
        for conv in conversations:
            role = conv.get("role", "user")
            content = conv.get("content", "")

            if role == "user":
                formatted += f"<|im_start|>user\n{content}<|im_end|>\n"
            elif role == "assistant":
                formatted += f"<|im_start|>assistant\n{content}<|im_end|>\n"

        return formatted


def load_config(config_path: str) -> dict:
    """YAML 설정 파일 로드"""
    with open(config_path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_dataset(json_path: str, image_dir: str) -> Dataset:
    """JSON 파일에서 데이터셋 로드"""
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    # 이미지 경로 추가
    for item in data:
        image_name = item.get("image", "")
        item["image_path"] = str(Path(image_dir) / image_name)

    return Dataset.from_list(data)


def setup_model_and_processor(config: dict):
    """모델과 프로세서 설정"""
    model_name = config["model"]["name"]

    # 4비트 양자화 설정
    bnb_config = None
    if config["hardware"].get("use_4bit", False):
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type=config["hardware"].get("bnb_4bit_quant_type", "nf4"),
            bnb_4bit_compute_dtype=getattr(
                torch,
                config["hardware"].get("bnb_4bit_compute_dtype", "bfloat16")
            ),
            bnb_4bit_use_double_quant=config["hardware"].get("use_nested_quant", True),
        )

    # 모델 로드
    model = AutoModelForVision2Seq.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        torch_dtype=torch.bfloat16,
        trust_remote_code=True,
        device_map="auto",
    )

    # 프로세서 로드
    processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)

    # Gradient checkpointing 활성화
    if config["training"].get("gradient_checkpointing", True):
        model.gradient_checkpointing_enable()

    # 4비트 학습을 위한 모델 준비
    if bnb_config:
        model = prepare_model_for_kbit_training(model)

    return model, processor


def setup_lora(model, config: dict):
    """LoRA 설정 및 적용"""
    lora_config = LoraConfig(
        r=config["lora"]["r"],
        lora_alpha=config["lora"]["lora_alpha"],
        lora_dropout=config["lora"]["lora_dropout"],
        target_modules=config["lora"]["target_modules"],
        bias=config["lora"]["bias"],
        task_type=TaskType.CAUSAL_LM,
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    return model


def setup_training_args(config: dict) -> TrainingArguments:
    """학습 인자 설정"""
    training_config = config["training"]
    model_config = config["model"]

    args = TrainingArguments(
        output_dir=model_config["output_dir"],
        num_train_epochs=training_config["num_epochs"],
        per_device_train_batch_size=training_config["per_device_train_batch_size"],
        per_device_eval_batch_size=training_config["per_device_eval_batch_size"],
        gradient_accumulation_steps=training_config["gradient_accumulation_steps"],
        learning_rate=training_config["learning_rate"],
        weight_decay=training_config["weight_decay"],
        warmup_ratio=training_config["warmup_ratio"],
        lr_scheduler_type=training_config["lr_scheduler_type"],
        bf16=training_config.get("bf16", True),
        tf32=training_config.get("tf32", True),
        logging_steps=training_config["logging_steps"],
        save_steps=training_config["save_steps"],
        eval_steps=training_config["eval_steps"],
        eval_strategy=training_config["evaluation_strategy"],
        save_total_limit=training_config["save_total_limit"],
        load_best_model_at_end=training_config["load_best_model_at_end"],
        metric_for_best_model=training_config["metric_for_best_model"],
        report_to=["wandb"] if config.get("wandb", {}).get("enabled", False) else ["none"],
        run_name=config.get("wandb", {}).get("run_name", "receipt-finetune"),
        remove_unused_columns=False,
        dataloader_pin_memory=True,
    )

    return args


def main():
    parser = argparse.ArgumentParser(description="Qwen3-VL 영수증 분석 파인튜닝")
    parser.add_argument(
        "--config",
        type=str,
        default="./configs/finetune_config.yaml",
        help="설정 파일 경로"
    )
    parser.add_argument(
        "--resume_from_checkpoint",
        type=str,
        default=None,
        help="체크포인트에서 재개"
    )

    args = parser.parse_args()

    # 설정 로드
    config = load_config(args.config)

    print("=" * 50)
    print("Qwen3-VL Receipt Analysis Fine-tuning")
    print("=" * 50)
    print(f"Model: {config['model']['name']}")
    print(f"Output: {config['model']['output_dir']}")
    print(f"LoRA rank: {config['lora']['r']}")
    print("=" * 50)

    # Wandb 설정
    if config.get("wandb", {}).get("enabled", False):
        import wandb
        wandb.init(
            project=config["wandb"]["project"],
            name=config["wandb"]["run_name"],
            tags=config["wandb"].get("tags", []),
        )

    # 모델 및 프로세서 설정
    print("\n[1/5] Loading model and processor...")
    model, processor = setup_model_and_processor(config)

    # LoRA 적용
    print("\n[2/5] Applying LoRA...")
    model = setup_lora(model, config)

    # 데이터셋 로드
    print("\n[3/5] Loading datasets...")
    dataset_config = config["dataset"]
    image_dir = dataset_config.get("image_dir", "./data/processed/images")

    train_dataset = load_dataset(dataset_config["train_path"], image_dir)
    eval_dataset = load_dataset(dataset_config["eval_path"], image_dir)

    print(f"Train samples: {len(train_dataset)}")
    print(f"Eval samples: {len(eval_dataset)}")

    # Data Collator 설정
    data_collator = ReceiptDataCollator(
        processor=processor,
        max_length=config["model"]["max_length"],
    )

    # 학습 인자 설정
    print("\n[4/5] Setting up training arguments...")
    training_args = setup_training_args(config)

    # Trainer 생성
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        data_collator=data_collator,
    )

    # 학습 시작
    print("\n[5/5] Starting training...")
    trainer.train(resume_from_checkpoint=args.resume_from_checkpoint)

    # 모델 저장
    print("\nSaving final model...")
    output_dir = config["model"]["output_dir"]
    trainer.save_model(output_dir)
    processor.save_pretrained(output_dir)

    # LoRA 가중치만 별도 저장
    lora_output_dir = f"{output_dir}-lora"
    model.save_pretrained(lora_output_dir)
    print(f"LoRA weights saved to: {lora_output_dir}")

    print("\n" + "=" * 50)
    print("Training completed!")
    print("=" * 50)
    print(f"\nTo merge LoRA weights and serve with vLLM:")
    print(f"  python merge_lora.py --base_model {config['model']['name']} --lora_path {lora_output_dir}")


if __name__ == "__main__":
    main()
