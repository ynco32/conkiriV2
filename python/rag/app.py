# app.py (FastAPI 버전)
import os
import re
import logging
import boto3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from chatbot_service import ConcertChatbot
from config import S3_BUCKET_NAME, S3_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY
from dotenv import load_dotenv
load_dotenv()


# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_BASE_URL = os.getenv("JAVA_BACKEND_URL", "http://localhost:8080")

app = FastAPI(title="콘끼리 챗봇 API", description="콘서트 관련 질문에 답변하는 챗봇 API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[API_BASE_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# 요청 모델 정의
class ChatRequest(BaseModel):
    query: str
    concert_id: int

# 응답 모델 정의
class ChatResponse(BaseModel):
    answer: str
    has_evidence_image: bool
    evidence_image_data: Optional[str] = None
    # source_documents: Optional[List[Dict[str, Any]]] = None

# 챗봇 인스턴스 생성
chatbot = ConcertChatbot()

@app.post("/api/chatbot", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    콘서트 관련 질문에 답변하는 API 엔드포인트
    
    - **query**: 사용자 질문
    - **concert_id**: 콘서트 ID
    
    응답에는 텍스트 답변과 Base64 인코딩된 이미지 데이터가 포함됩니다.
    """
    try:
        # 질의 처리
        response = chatbot.process_query(request.query, request.concert_id)
        
        # ✅ 응답 그대로 반환 (이미지 URL 처리 로직 제거)
        return response
    
    except Exception as e:
        logger.error(f"API 요청 처리 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"요청 처리 중 오류가 발생했습니다: {str(e)}")

@app.get("/chatbot/health")
async def health_check():
    """서버 상태 확인용 엔드포인트"""
    return {"status": "healthy", "service": "콘끼리 챗봇 API"}

@app.get("/")
async def root():
    """API 루트 엔드포인트"""
    return {
        "message": "콘끼리 챗봇 API에 오신 것을 환영합니다!",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

# OpenAPI 문서 설정
app.title = "콘끼리 챗봇 API"
app.description = "콘서트 관련 질문에 답변하고 시각적 증거를 제공하는 AI 챗봇 API"
app.version = "1.0.0"

if __name__ == "__main__":
    import uvicorn
    # 서버 실행 설정
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    logger.info(f"콘끼리 챗봇 API 서버를 {host}:{port}에서 시작합니다...")
    uvicorn.run(app, host=host, port=port)