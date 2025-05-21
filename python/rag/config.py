import os
from dotenv import load_dotenv
load_dotenv()

S3_REGION = os.getenv("S3_REGION", "ap-northeast-2")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
S3_BUCKET_NAME ="chatbot-capture-images"