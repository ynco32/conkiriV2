import os
import logging
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

# 환경 변수 로드
load_dotenv()

# 로깅 설정
logger = logging.getLogger(__name__)

# API 키 가져오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENVIRONMENT")
PINECONE_INDEX_NAME = "concert"

def get_embeddings_model():
    """OpenAI 임베딩 모델을 설정합니다."""
    logger.info("OpenAI 임베딩 모델 초기화 중...")
    
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")
    
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=OPENAI_API_KEY
    )
    
    logger.info("임베딩 모델 초기화 완료!")
    return embeddings

def setup_pinecone_vectorstore(embeddings, concert_info):
    """Pinecone 벡터 저장소를 설정합니다."""
    if not PINECONE_API_KEY:
        raise ValueError("Pinecone API 키가 설정되지 않았습니다.")
    
    logger.info("Pinecone 초기화 중...")

    concert_id = concert_info.get('concert_id')
    namespace = f"concert_id_{concert_id}"

    logger.info(f"네임스페이스 '{namespace}'를 사용합니다.")
    
    # PineconeVectorStore 생성 (간소화된 방식)
    vectorstore = PineconeVectorStore.from_existing_index(
        index_name=PINECONE_INDEX_NAME,
        embedding=embeddings,
        text_key="text",
        namespace=namespace
    )
    
    logger.info("Pinecone 벡터 저장소 설정 완료!")
    return vectorstore

def add_documents_to_vectorstore(texts, metadatas, vectorstore):
    """문서를 벡터스토어에 추가합니다."""
    logger.info(f"총 {len(texts)}개의 문서를 벡터스토어에 추가합니다...")
    
    # 배치 처리 (메모리 효율성)
    batch_size = 100
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i+batch_size]
        batch_metadatas = metadatas[i:i+batch_size] if metadatas else None
        
        vectorstore.add_texts(
            texts=batch_texts,
            metadatas=batch_metadatas
        )
        
        logger.info(f"배치 {i//batch_size + 1}: {len(batch_texts)}개 문서 추가 완료")
    
    logger.info("모든 문서가 벡터스토어에 추가되었습니다!")
    return vectorstore