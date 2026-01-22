"""Chatbot router"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.chat import ChatRequest, ChatResponse
from app.main import get_llm_service

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with AI assistant"""
    try:
        llm_service = get_llm_service()

        response = await llm_service.chat(
            message=request.message,
            context=request.context,
            history=request.history,
        )

        return response

    except Exception as e:
        return ChatResponse(
            message=f"죄송합니다, 오류가 발생했습니다: {str(e)}",
        )


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Chat with AI assistant (streaming response)"""
    llm_service = get_llm_service()

    async def generate():
        async for chunk in llm_service.chat_stream(
            message=request.message,
            context=request.context,
            history=request.history,
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
    )
