"""LLM Service for Chatbot"""

import os
from typing import Optional, AsyncGenerator

from app.models.chat import ChatMessage, ChatResponse


class LLMService:
    """Large Language Model service for chatbot"""

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.is_loaded = False
        self._load_model()

    def _load_model(self):
        """Load LLM model"""
        try:
            model_name = os.getenv("LLM_MODEL", "Qwen/Qwen2.5-7B-Instruct")

            # For development/testing, skip loading
            if os.getenv("SKIP_MODEL_LOADING", "false").lower() == "true":
                print("⚠️ Skipping LLM model loading (development mode)")
                self.is_loaded = True
                return

            from transformers import AutoModelForCausalLM, AutoTokenizer
            import torch

            print(f"📥 Loading LLM model: {model_name}")

            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None,
            )

            self.is_loaded = True
            print("✅ LLM model loaded")

        except Exception as e:
            print(f"❌ Failed to load LLM model: {e}")
            self.is_loaded = False

    async def chat(
        self,
        message: str,
        context: Optional[str] = None,
        history: Optional[list[ChatMessage]] = None,
    ) -> ChatResponse:
        """Generate chat response"""

        # If model not loaded, return mock response
        if self.model is None:
            return self._mock_response(message)

        # Build messages
        messages = self._build_messages(message, context, history)

        # Generate
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = self.tokenizer(text, return_tensors="pt")
        if self.model.device.type == "cuda":
            inputs = inputs.to("cuda")

        outputs = self.model.generate(
            **inputs,
            max_new_tokens=512,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
        )

        response_text = self.tokenizer.decode(
            outputs[0][inputs.input_ids.shape[1]:],
            skip_special_tokens=True,
        )

        return ChatResponse(
            message=response_text,
            tokens_used=outputs.shape[1],
        )

    async def chat_stream(
        self,
        message: str,
        context: Optional[str] = None,
        history: Optional[list[ChatMessage]] = None,
    ) -> AsyncGenerator[str, None]:
        """Generate streaming chat response"""

        # If model not loaded, yield mock response
        if self.model is None:
            mock = self._mock_response(message)
            for word in mock.message.split():
                yield word + " "
            return

        # Build messages
        messages = self._build_messages(message, context, history)

        # Generate with streaming
        from transformers import TextIteratorStreamer
        import threading

        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = self.tokenizer(text, return_tensors="pt")
        if self.model.device.type == "cuda":
            inputs = inputs.to("cuda")

        streamer = TextIteratorStreamer(
            self.tokenizer,
            skip_prompt=True,
            skip_special_tokens=True,
        )

        generation_kwargs = {
            **inputs,
            "streamer": streamer,
            "max_new_tokens": 512,
            "do_sample": True,
            "temperature": 0.7,
            "top_p": 0.9,
        }

        thread = threading.Thread(target=self.model.generate, kwargs=generation_kwargs)
        thread.start()

        for text in streamer:
            yield text

    def _build_messages(
        self,
        message: str,
        context: Optional[str],
        history: Optional[list[ChatMessage]],
    ) -> list[dict]:
        """Build message list for chat"""

        system_prompt = """당신은 여행 지출 관리 앱 'Travel Helper'의 AI 어시스턴트입니다.
사용자의 여행 지출 관련 질문에 친절하고 간결하게 답변해주세요.
한국어로 답변하며, 숫자는 천 단위 구분자(,)를 사용합니다.
"""

        if context:
            system_prompt += f"\n\n사용자 컨텍스트:\n{context}"

        messages = [{"role": "system", "content": system_prompt}]

        if history:
            for h in history:
                messages.append({"role": h.role, "content": h.content})

        messages.append({"role": "user", "content": message})

        return messages

    def _mock_response(self, message: str) -> ChatResponse:
        """Return mock response for development"""

        # Simple rule-based responses
        if "오늘" in message and "얼마" in message:
            return ChatResponse(
                message="오늘은 총 45,000원을 사용하셨어요. 식비 25,000원, 교통비 12,000원, 기타 8,000원입니다.",
            )

        if "예산" in message:
            return ChatResponse(
                message="현재 예산 잔액은 285,000원이에요. 일평균 95,000원을 사용하고 계시니, 약 3일 정도 더 사용하실 수 있어요.",
            )

        if "카테고리" in message or "많이" in message:
            return ChatResponse(
                message="이번 여행에서 가장 많이 지출한 카테고리는 '식비'로, 전체의 35% (약 420,000원)를 차지하고 있어요.",
            )

        return ChatResponse(
            message=f"안녕하세요! 여행 지출 관련 질문이 있으시면 편하게 물어보세요. (모델 미로드 상태)",
        )
