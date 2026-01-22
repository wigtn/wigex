"""VLM Service for Receipt OCR"""

import os
import json
import re
from typing import Optional
from PIL import Image

from app.models.receipt import ReceiptAnalysis, ReceiptItem


class VLMService:
    """Vision Language Model service for receipt analysis"""

    def __init__(self):
        self.model = None
        self.processor = None
        self.is_loaded = False
        self._load_model()

    def _load_model(self):
        """Load VLM model"""
        try:
            # Check if we should use a local model
            model_name = os.getenv("VLM_MODEL", "Qwen/Qwen2-VL-7B-Instruct")

            # For development/testing, we can skip loading the actual model
            if os.getenv("SKIP_MODEL_LOADING", "false").lower() == "true":
                print("⚠️ Skipping VLM model loading (development mode)")
                self.is_loaded = True
                return

            from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
            import torch

            print(f"📥 Loading VLM model: {model_name}")

            self.processor = AutoProcessor.from_pretrained(model_name)
            self.model = Qwen2VLForConditionalGeneration.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None,
            )

            self.is_loaded = True
            print("✅ VLM model loaded")

        except Exception as e:
            print(f"❌ Failed to load VLM model: {e}")
            self.is_loaded = False

    async def analyze_receipt(self, image: Image.Image) -> ReceiptAnalysis:
        """Analyze a receipt image"""

        # If model not loaded, return mock data for development
        if self.model is None:
            return self._mock_analysis()

        prompt = """Analyze this receipt image and extract the following information in JSON format:
{
  "store": "store name",
  "date": "YYYY-MM-DD",
  "time": "HH:mm" (if visible),
  "items": [{"name": "item name", "price": 100.0, "quantity": 1}],
  "subtotal": 100.0 (if visible),
  "tax": 10.0 (if visible),
  "total": 110.0,
  "currency": "USD" (detect from receipt, common: USD, EUR, JPY, KRW, etc.),
  "category": "food" (one of: food, transport, shopping, lodging, activity, etc),
  "confidence": 0.95 (your confidence level 0-1)
}

Only return valid JSON, no other text."""

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt},
                ],
            }
        ]

        # Process input
        text = self.processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        inputs = self.processor(
            text=[text],
            images=[image],
            return_tensors="pt",
        )

        if self.model.device.type == "cuda":
            inputs = inputs.to("cuda")

        # Generate
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=1024,
            do_sample=False,
        )

        # Decode
        generated_text = self.processor.batch_decode(
            outputs[:, inputs.input_ids.shape[1]:],
            skip_special_tokens=True,
        )[0]

        # Parse JSON from response
        return self._parse_response(generated_text)

    def _parse_response(self, text: str) -> ReceiptAnalysis:
        """Parse VLM response into ReceiptAnalysis"""
        try:
            # Extract JSON from response
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                data = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")

            # Convert items
            items = [
                ReceiptItem(
                    name=item.get("name", "Unknown"),
                    price=float(item.get("price", 0)),
                    quantity=int(item.get("quantity", 1)),
                )
                for item in data.get("items", [])
            ]

            return ReceiptAnalysis(
                store=data.get("store", "Unknown"),
                date=data.get("date", ""),
                time=data.get("time"),
                items=items,
                subtotal=data.get("subtotal"),
                tax=data.get("tax"),
                total=float(data.get("total", 0)),
                currency=data.get("currency", "KRW"),
                category=data.get("category", "etc"),
                confidence=float(data.get("confidence", 0.5)),
                raw_text=text,
            )

        except Exception as e:
            print(f"Failed to parse VLM response: {e}")
            return self._mock_analysis()

    def _mock_analysis(self) -> ReceiptAnalysis:
        """Return mock data for development"""
        return ReceiptAnalysis(
            store="Sample Store",
            date="2025-01-22",
            time="14:30",
            items=[
                ReceiptItem(name="Coffee", price=4.50, quantity=1),
                ReceiptItem(name="Sandwich", price=8.00, quantity=1),
            ],
            subtotal=12.50,
            tax=1.25,
            total=13.75,
            currency="USD",
            category="food",
            confidence=0.85,
            raw_text="[Mock data - model not loaded]",
        )
