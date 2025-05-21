# process_local_image.py
import argparse
import os
import sys
import boto3
from PIL import Image
import io
import uuid
import json

# 현재 디렉토리를 파이썬 경로에 추가
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# 기존 모듈 임포트
from config import S3_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_REGION
from processor.image_processor import ImageProcessor

def process_local_image(concert_id, local_image_path, show_id, slice_height=2000):
    """로컬 이미지를 처리하여 OCR 추출 및 S3 업로드"""
    try:
        print(f"로컬 이미지 처리 시작: {local_image_path}")
        print(f"이미지 분할 높이: {slice_height}픽셀")
        
        # 이미지 파일 존재 확인
        if not os.path.exists(local_image_path):
            print(f"오류: 이미지 파일이 존재하지 않습니다: {local_image_path}")
            return False
        
        # 로컬 이미지 로드
        with open(local_image_path, 'rb') as f:
            image_data = f.read()
        
        img = Image.open(io.BytesIO(image_data))
        width, height = img.size
        print(f"이미지 로드 성공: {width}x{height} 픽셀, {len(image_data)/1024:.2f} KB")
        
        # 원본 이미지 S3 업로드
        s3_key = f"chunks/notice_{show_id}.jpg"
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
            region_name=S3_REGION
        )
        
        print(f"☁️ 원본 이미지 S3 업로드 중: {s3_key}")
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=image_data,
            ContentType='image/jpeg'
        )
        
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{S3_REGION}.amazonaws.com/{s3_key}"
        print(f"✅ 이미지 S3 업로드 완료: {s3_url}")
        
        # 이미지 분할 설정
        max_height = slice_height  # 슬라이스 높이
        overlap = 100  # 슬라이스 간 겹치는 부분 (더 작게 조정)
        
        full_text = ""
        full_ocr_result = {
            "images": [
                {
                    "fields": []
                }
            ]
        }
        
        # OCR 처리 - 이미지 크기에 따른 분할 처리
        if height <= max_height:
            # 작은 이미지는 그대로 처리
            part_result = ImageProcessor.extract_text_with_ocr(image_data)
            if part_result and "images" in part_result and part_result["images"]:
                fields = part_result["images"][0].get("fields", [])
                full_ocr_result["images"][0]["fields"] = fields
                
                for field in fields:
                    if "inferText" in field:
                        full_text += field["inferText"] + " "
                        
                print(f"OCR 텍스트 추출 완료: {len(fields)}개 필드")
        else:
            # 큰 이미지는 분할하여 처리
            parts_count = (height // (max_height - overlap)) + 1
            print(f"이미지를 {parts_count}개의 조각으로 분할하여 처리합니다.")
            
            for i in range(parts_count):
                # 시작 및 종료 위치 계산
                start_y = i * (max_height - overlap)
                end_y = min(start_y + max_height, height)
                
                # 조각 이미지 생성
                part = img.crop((0, start_y, width, end_y))
                
                # 메모리에 저장
                buffer = io.BytesIO()
                part.convert('RGB').save(buffer, format="JPEG")
                buffer.seek(0)
                part_data = buffer.read()
                
                # OCR 처리
                print(f"조각 {i+1}/{parts_count} OCR 처리 중... (y={start_y}~{end_y})")
                part_result = ImageProcessor.extract_text_with_ocr(part_data)
                
                part_text = ""
                if part_result and "images" in part_result and part_result["images"]:
                    fields = part_result["images"][0].get("fields", [])
                    print(f"  조각 {i+1}에서 {len(fields)}개 필드 추출됨")
                    
                    # Y 좌표 보정
                    for field in fields:
                        if "boundingPoly" in field and "vertices" in field["boundingPoly"]:
                            for vertex in field["boundingPoly"]["vertices"]:
                                if "y" in vertex:
                                    vertex["y"] += start_y
                        
                        if "inferText" in field:
                            part_text += field["inferText"] + " "
                    
                    # 변환된 필드를 결과에 추가
                    full_ocr_result["images"][0]["fields"].extend(fields)
                else:
                    print(f"  ⚠️ 조각 {i+1}에서 텍스트를 추출하지 못했습니다.")
                
                if part_text:
                    full_text += part_text + " "
                    print(f"  텍스트 길이: {len(part_text)}자")
                
                # 메모리 정리
                buffer.close()
            
            # 모든 분할 처리 완료 후, Y 좌표로 정렬
            if full_ocr_result["images"][0]["fields"]:
                print("모든 필드를 Y 좌표 기준으로 정렬 중...")
                full_ocr_result["images"][0]["fields"].sort(
                    key=lambda f: f["boundingPoly"]["vertices"][0]["y"]
                )
            
            print(f"✅ 모든 분할 처리 완료: {len(full_ocr_result['images'][0]['fields'])}개 텍스트 항목 추출")
            
            # 중복 제거 (ImageProcessor의 메서드 재활용)
            print("중복 텍스트 필드 제거 중...")
            before_count = len(full_ocr_result["images"][0]["fields"])
            full_ocr_result["images"][0]["fields"] = ImageProcessor.remove_duplicate_text_fields(
                full_ocr_result["images"][0]["fields"]
            )
            after_count = len(full_ocr_result["images"][0]["fields"])
            print(f"중복 제거: {before_count}개 → {after_count}개 (제거됨: {before_count - after_count}개)")
        
        # OCR 결과 S3에 저장
        ocr_key = f"ocr_results/ocr_result_{show_id}.json"
        print(f"☁️ OCR 결과 S3 업로드 중: {ocr_key}")
        
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=ocr_key,
            Body=json.dumps(full_ocr_result, ensure_ascii=False).encode('utf-8'),
            ContentType='application/json; charset=utf-8'
        )
        
        s3_ocr_url = f"https://{S3_BUCKET_NAME}.s3.{S3_REGION}.amazonaws.com/{ocr_key}"
        print(f"✅ OCR 결과 S3 업로드 완료: {s3_ocr_url}")
        print(f"OCR 텍스트 길이: {len(full_text)}자")
        
        # 추출된 텍스트 미리보기 (처음 500자)
        if full_text:
            preview = full_text[:500] + ("..." if len(full_text) > 500 else "")
            print(f"\n텍스트 미리보기:\n{preview}\n")
        
        print("\n이제 다음 명령으로 RAG 시스템을 업데이트하세요:")
        print(f"python main.py --ocr_file {ocr_key} --concert_id {concert_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ 처리 중 오류: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="로컬 이미지 처리 및 OCR")
    parser.add_argument("--concert_id", required=True, help="콘서트 ID")
    parser.add_argument("--local_image", required=True, help="로컬 이미지 파일 경로")
    parser.add_argument("--show_id", required=True, help="사용할 show_id")
    parser.add_argument("--slice_height", type=int, default=2000, help="이미지 슬라이스 높이 (기본값: 2000)")
    
    args = parser.parse_args()
    process_local_image(
        args.concert_id, 
        args.local_image, 
        args.show_id, 
        args.slice_height
    )