"""Chat data models"""

from pydantic import BaseModel
from typing import Optional


class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    history: Optional[list[ChatMessage]] = None


class ChatResponse(BaseModel):
    message: str
    tokens_used: Optional[int] = None
