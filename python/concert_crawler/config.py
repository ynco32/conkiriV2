import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경 변수에서 API 키 불러오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# OCR API 설정
OCR_API_URL = "https://oe7fe4lwbg.apigw.ntruss.com/custom/v1/41432/d0512270cb2eb7d3b6f7d52775d9cbffe7040d7e4012480b58c6801ffcad068f/general"
OCR_SECRET_KEY = "eG9WbHd3cHhPU1JnemRQYXRtRUFEVXBnWHFSZFFPa1E="  
OCR_API_KEY = "Edx7NLBFZ7q4W1Je02zTwCWnoWPLZ1SmPcBYha7e"        

# S3 설정
S3_BUCKET_NAME = "chatbot-capture-images"
S3_BASE_FOLDER = "chunks"
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY") 
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
S3_REGION = os.getenv("S3_REGION", "ap-northeast-2")


# 데이터베이스 설정
DB_CONFIG = {
    'host': 'localhost',
    'user': 'ssafy',
    'password': 'ssafy',
    'db': 'conkiri',
    'charset': 'utf8mb4'
}

# 크롤링 설정
INTERPARK_BASE_URL = "http://www.playdb.co.kr/playdb/playdblist.asp"
MELON_BASE_URL = "https://ticket.melon.com/concert/index.htm?genreType=GENRE_CON"
DETAIL_URL_TEMPLATE = "http://www.playdb.co.kr/playdb/playdbdetail.asp?sReqPlayNo={}"
HEADERS = {"User-Agent": "Mozilla/5.0"}
FILTERED_VENUES = [
    "고양종합운동장", "인스파이어", 
    "잠실실내체육관", "올림픽홀", "핸드볼경기장",
    "상암월드컵", "고척", "KSPO",
]

# 이미지 저장 경로
TEMP_IMAGE_DIR = "temp_images"

# API 엔드포인트 설정 (Java API)
API_BASE_URL = os.getenv("API_BASE_URL")