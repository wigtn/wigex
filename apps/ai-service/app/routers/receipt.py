"""Receipt OCR router"""

from fastapi import APIRouter, HTTPException
import base64
from io import BytesIO
from PIL import Image

from app.models.receipt import (
    AnalyzeReceiptRequest,
    AnalyzeReceiptResponse,
)
from app.main import get_vlm_service

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeReceiptResponse)
async def analyze_receipt(request: AnalyzeReceiptRequest):
    """Analyze a receipt image and extract expense information"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        image = Image.open(BytesIO(image_data))

        # Get VLM service
        vlm_service = get_vlm_service()

        # Analyze receipt
        analysis = await vlm_service.analyze_receipt(image)

        return AnalyzeReceiptResponse(
            success=True,
            analysis=analysis,
        )

    except Exception as e:
        return AnalyzeReceiptResponse(
            success=False,
            error=str(e),
        )
