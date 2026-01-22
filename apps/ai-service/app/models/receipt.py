"""Receipt analysis data models"""

from pydantic import BaseModel
from typing import Optional


class ReceiptItem(BaseModel):
    name: str
    price: float
    quantity: int = 1


class ReceiptAnalysis(BaseModel):
    store: str
    date: str  # YYYY-MM-DD
    time: Optional[str] = None  # HH:mm
    items: list[ReceiptItem]
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: float
    currency: str
    category: str  # food, transport, shopping, lodging, activity, etc
    confidence: float  # 0.0 ~ 1.0
    raw_text: Optional[str] = None


class AnalyzeReceiptRequest(BaseModel):
    image: str  # Base64 encoded image
    mimeType: str  # image/jpeg, image/png


class AnalyzeReceiptResponse(BaseModel):
    success: bool
    analysis: Optional[ReceiptAnalysis] = None
    error: Optional[str] = None
