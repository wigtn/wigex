"""
Travel Helper AI Service
- Receipt OCR using VLM
- Chatbot using LLM
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import receipt, chat
from app.services.vlm_service import VLMService
from app.services.llm_service import LLMService

# Global service instances
vlm_service: VLMService | None = None
llm_service: LLMService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup AI services"""
    global vlm_service, llm_service

    print("🚀 Loading AI models...")

    # Initialize services
    vlm_service = VLMService()
    llm_service = LLMService()

    print("✅ AI models loaded successfully")

    yield

    # Cleanup
    print("🧹 Cleaning up AI services...")
    vlm_service = None
    llm_service = None


app = FastAPI(
    title="Travel Helper AI Service",
    description="AI-powered receipt OCR and chatbot service",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - Environment-aware configuration
cors_origins_env = os.getenv("CORS_ORIGIN", "*")
cors_origins = cors_origins_env.split(",") if cors_origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(receipt.router, prefix="/receipt", tags=["Receipt OCR"])
app.include_router(chat.router, prefix="/chat", tags=["Chatbot"])


@app.get("/")
async def root():
    return {"message": "Travel Helper AI Service", "status": "running"}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "vlm_loaded": vlm_service is not None and vlm_service.is_loaded,
        "llm_loaded": llm_service is not None and llm_service.is_loaded,
    }


def get_vlm_service() -> VLMService:
    if vlm_service is None:
        raise RuntimeError("VLM service not initialized")
    return vlm_service


def get_llm_service() -> LLMService:
    if llm_service is None:
        raise RuntimeError("LLM service not initialized")
    return llm_service
