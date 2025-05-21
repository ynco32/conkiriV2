# image_cropper.py
import os
import io
import logging
import boto3
import requests
from PIL import Image
from dotenv import load_dotenv
from config import S3_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY
import boto3 
import base64
import io     
from config import S3_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_REGION 

# 환경 변수 로드
load_dotenv()

# 로깅 설정
logger = logging.getLogger(__name__)

class ImageCropper:


    @staticmethod
    def get_notice_image_url(concert_id):
        """
        concert_notice 테이블에서 콘서트 ID에 해당하는 공지사항 이미지 URL을 가져옵니다.
        
        Args:
            concert_id: 콘서트 ID
            
        Returns:
            str: 공지사항 이미지 URL, 실패 시 None
        """
        try:
            # 기존 DB 연결 사용
            from db_connector import get_connection
            conn = get_connection()
            
            if not conn:
                logger.warning("DB 연결을 사용할 수 없습니다. 대체 방법을 사용합니다.")
                # 하드코딩된 이미지 URL (임시)
                sample_notice_urls = {
                    41: "https://chatbot-capture-images.s3.ap-northeast-2.amazonaws.com/chunks/notice_211158.jpg",
                    # 필요에 따라 더 추가
                }
                return sample_notice_urls.get(concert_id)
            
            cursor = conn.cursor(dictionary=True)
            
            # concert_notice 테이블에서 해당 concert_id에 매칭되는 notice_image_url 조회
            query = """
            SELECT notice_image_url
            FROM concert_notice
            WHERE concert_id = %s
            LIMIT 1
            """
            
            cursor.execute(query, (concert_id,))
            result = cursor.fetchone()
            
            if cursor:
                cursor.close()
            if conn and hasattr(conn, 'close'):
                conn.close()
            
            if result and 'notice_image_url' in result:
                logger.info(f"콘서트 ID {concert_id}의 공지사항 이미지 URL: {result['notice_image_url']}")
                return result['notice_image_url']
            else:
                logger.warning(f"콘서트 ID {concert_id}에 대한 공지사항 이미지 URL을 찾을 수 없습니다.")
                return None
            
        except Exception as e:
            logger.error(f"공지사항 이미지 URL 조회 중 오류: {str(e)}")
            return None

    @staticmethod
    def get_image_from_s3(image_url=None):
        """
        이미지 URL에서 이미지를 다운로드합니다.
        S3 URL의 경우 인증된 방식으로 접근합니다.
        
        Args:
            image_url: 이미지 URL
            
        Returns:
            PIL.Image: 이미지 객체, 실패 시 None
        """
        try:
            logger.info(f"이미지 다운로드 시도: {image_url}")
            
            # S3 URL 확인
            if '.s3.' in image_url and 'amazonaws.com' in image_url:
                logger.info("S3 URL 감지됨, 인증된 방식으로 접근합니다.")
                
                # 버킷 이름 (하드코딩)
                bucket_name = "chatbot-capture-images"
                
                # 키 추출 (URL에서 경로 부분)
                key = image_url.split('.com/')[1] if '.com/' in image_url else None
                
                if not key:
                    logger.error("URL에서 키를 추출할 수 없습니다.")
                    return None
                
                logger.info(f"추출된 S3 키: {key}")
                
                # S3 클라이언트 초기화
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=AWS_ACCESS_KEY,
                    aws_secret_access_key=AWS_SECRET_KEY,
                    region_name=S3_REGION
                )
                
                # S3에서 이미지 다운로드
                response = s3_client.get_object(
                    Bucket=bucket_name,
                    Key=key
                )
                
                # 이미지 데이터 읽기
                image_data = response['Body'].read()
                
                # PIL Image 객체로 변환
                image = Image.open(io.BytesIO(image_data))
                logger.info(f"S3에서 이미지 다운로드 완료: {image.width}x{image.height} 픽셀")
                
                return image
            
            else:
                # 일반 HTTP URL일 경우에만 시도 (S3가 아닌 경우)
                logger.info("일반 HTTP URL로 시도합니다.")
                response = requests.get(image_url)
                response.raise_for_status()
                
                image = Image.open(io.BytesIO(response.content))
                logger.info(f"HTTP 요청으로 이미지 다운로드 완료: {image.width}x{image.height} 픽셀")
                
                return image
                    
        except Exception as e:
            logger.error(f"이미지 다운로드 중 오류: {str(e)}")
            return None
        
    @staticmethod
    def crop_image(image, coordinates, padding=20):
        """
        이미지에서 특정 영역을 크롭합니다.
        
        Args:
            image: PIL.Image 객체
            coordinates: 크롭할 좌표 정보 (top_y, bottom_y)
            padding: 상하 패딩 (픽셀)
            
        Returns:
            PIL.Image: 크롭된 이미지, 실패 시 None
        """
        try:
            if not image:
                logger.error("크롭할 이미지가 없습니다.")
                return None
                
            # 좌표 추출
            top_y = coordinates.get('top_y', 0)
            bottom_y = coordinates.get('bottom_y', 0)
            
            # 유효성 검사
            if not isinstance(top_y, (int, float)) or not isinstance(bottom_y, (int, float)):
                logger.error(f"유효하지 않은 좌표 값: top_y={top_y}, bottom_y={bottom_y}")
                return None
                
            if top_y >= bottom_y:
                logger.error(f"top_y가 bottom_y보다 크거나 같습니다: top_y={top_y}, bottom_y={bottom_y}")
                return None
            
            # 이미지 크기 확인
            width, height = image.size
            
            # 패딩 적용 및 이미지 경계 확인
            crop_top = max(0, top_y - padding)
            crop_bottom = min(height, bottom_y + padding)
            
            if crop_top >= crop_bottom:
                logger.error("유효한 크롭 영역이 없습니다.")
                return None
            
            # 좌우는 전체 이미지 너비 사용
            crop_box = (0, crop_top, width, crop_bottom)
            
            # 이미지 크롭
            logger.info(f"이미지 크롭 중: {crop_box}")
            cropped_img = image.crop(crop_box)
            
            logger.info(f"이미지 크롭 완료: {cropped_img.width}x{cropped_img.height} 픽셀")
            return cropped_img
            
        except Exception as e:
            logger.error(f"이미지 크롭 중 오류: {str(e)}")
            return None
    
    @staticmethod
    def crop_and_encode_image(image, coordinates, padding=20):
        """
        이미지를 크롭하고 Base64로 인코딩합니다.
        
        Args:
            image: PIL.Image 객체
            coordinates: 크롭할 좌표 정보 (top_y, bottom_y)
            padding: 상하 패딩 (픽셀)
            
        Returns:
            str: Base64 인코딩된 이미지 문자열, 실패 시 None
        """
        try:
            cropped_img = ImageCropper.crop_image(image, coordinates, padding)
            
            if not cropped_img:
                logger.error("이미지 크롭에 실패했습니다.")
                return None
                
            # 이미지를 바이트로 변환
            byte_arr = io.BytesIO()
            cropped_img.save(byte_arr, format='JPEG')
            byte_arr.seek(0)
            
            # Base64로 인코딩
            img_base64 = base64.b64encode(byte_arr.read()).decode('utf-8')
            
            # 데이터 URI 형식으로 반환 (프론트엔드에서 바로 사용 가능)
            data_uri = f"data:image/jpeg;base64,{img_base64}"
            logger.info(f"이미지 크롭 및 Base64 인코딩 완료: {len(data_uri)} 바이트")
            
            return data_uri
                
        except Exception as e:
            logger.error(f"이미지 인코딩 중 오류: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return None
    # 클래스 변수로 캐시 추가
    image_url_cache = {}  # {cache_key: s3_url}

    @staticmethod
    def get_evidence_image(concert_id, coordinates, image_url=None):
        """
        증거 이미지를 가져오고 크롭한 후 Base64로 인코딩합니다.
        
        Args:
            concert_id: 콘서트 ID
            coordinates: 크롭할 좌표 정보 (top_y, bottom_y)
            image_url: 직접 지정한 이미지 URL (None이면 DB에서 조회)
            
        Returns:
            str: Base64 인코딩된 이미지 데이터 URI, 실패 시 None
        """
        try:
            # 이미지 URL 가져오기
            if not image_url:
                image_url = ImageCropper.get_notice_image_url(concert_id)
                    
            if not image_url:
                logger.error(f"콘서트 ID {concert_id}에 대한 이미지 URL을 찾을 수 없습니다.")
                return None
            
            # 이미지 다운로드
            image = ImageCropper.get_image_from_s3(image_url)
            
            if not image:
                logger.error("이미지를 다운로드하지 못했습니다.")
                return None
            
            # 이미지 크롭 및 Base64 인코딩
            return ImageCropper.crop_and_encode_image(image, coordinates)
                
        except Exception as e:
            logger.error(f"증거 이미지 처리 중 오류: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return None