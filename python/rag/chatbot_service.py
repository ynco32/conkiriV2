# chatbot_service.py
import os
import logging
import uuid
from dotenv import load_dotenv
from embedding_manager import get_embeddings_model, setup_pinecone_vectorstore
from rag_engine import create_rag_chain, query_rag_system
from image_cropper import ImageCropper
from db_connector import get_concert_info

# 환경 변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConcertChatbot:
    """콘서트 챗봇 클래스"""
    
    def __init__(self):
        """챗봇 초기화"""
        self.embeddings = None
        self.vectorstore_cache = {}  # 콘서트 ID별 벡터 저장소 캐시
        self.chain_cache = {}        # 콘서트 ID별 RAG 체인 캐시
        self.temp_dir = "temp_images" # 임시 이미지 저장 디렉토리
        
        # 임시 디렉토리 생성
        os.makedirs(self.temp_dir, exist_ok=True)
        
        # 임베딩 모델 초기화
        try:
            self.embeddings = get_embeddings_model()
            logger.info("임베딩 모델 초기화 완료")
        except Exception as e:
            logger.error(f"임베딩 모델 초기화 실패: {str(e)}")
    
    def get_rag_chain(self, concert_id):
        """특정 콘서트의 RAG 체인을 가져옵니다."""
        # 캐시에 있으면 캐시된 체인 반환
        if concert_id in self.chain_cache:
            return self.chain_cache[concert_id]
        
        # 콘서트 정보 가져오기
        concert_info = get_concert_info(concert_id)
        if not concert_info:
            logger.error(f"콘서트 ID {concert_id}에 대한 정보를 찾을 수 없습니다.")
            return None
        
        # 벡터 저장소 설정
        try:
            if concert_id not in self.vectorstore_cache:
                vectorstore = setup_pinecone_vectorstore(self.embeddings, concert_info)
                self.vectorstore_cache[concert_id] = vectorstore
            else:
                vectorstore = self.vectorstore_cache[concert_id]
            
            # RAG 체인 생성
            chain = create_rag_chain(vectorstore)
            self.chain_cache[concert_id] = chain
            
            return chain
        except Exception as e:
            logger.error(f"RAG 체인 생성 중 오류: {str(e)}")
            return None
    
    def process_query(self, query, concert_id):
        """사용자 질의를 처리하고 응답을 생성합니다."""
        try:
            concert_info = get_concert_info(concert_id)
            # RAG 체인 가져오기
            chain = self.get_rag_chain(concert_id)
            if not chain:
                return {
                    "answer": "죄송합니다, 해당 콘서트 정보를 처리할 수 없습니다 뿌우...",
                    "has_evidence_image": False,
                    "evidence_image_url": None,
                    "source_documents": []
                }
            
            # 질의 처리
            response = query_rag_system(chain, query, concert_id, concert_info)
            
            # 시각적 증거 추가 (좌표가 있는 경우만)
            evidence_image_data = None
            coordinates = None
            if response.get("evidence_coordinates") and len(response["evidence_coordinates"]) > 0:
                # 첫 번째 좌표 사용 (GPT가 선택한 좌표)
                coordinates = response["evidence_coordinates"][0]
                
            # 이미지 크롭 및 Base64 인코딩 (URL 반환 대신)
            evidence_image_data = ImageCropper.get_evidence_image(concert_id, coordinates)
            logger.info(f"증거 이미지 인코딩 완료: {evidence_image_data is not None}")
            
            # 최종 응답 생성
            final_response = {
                "answer": response.get("answer", "답변을 생성할 수 없습니다 뿌우..."),
                "has_evidence_image": evidence_image_data is not None,
                "evidence_image_data": evidence_image_data,  
                # "source_documents": response.get("source_documents", []) # 추후 로그 필요시 활성화
            }
            
            return final_response
            
        except Exception as e:
            logger.error(f"질의 처리 중 오류: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                "answer": f"죄송합니다, 질문 처리 중 오류가 발생했습니다 뿌우...",
                "has_evidence_image": False,
                "evidence_image_data": None,
                # "source_documents": []
            }