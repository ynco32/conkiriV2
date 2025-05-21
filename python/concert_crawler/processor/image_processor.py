# ocr_processor.py
import uuid
import time
import base64
import requests
import io
from PIL import Image
import boto3
import os
import json
import gc  # 가비지 컬렉션
from config import OCR_API_URL, OCR_SECRET_KEY, OCR_API_KEY, S3_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_REGION

class ImageProcessor:
    @staticmethod
    def process_notice_image(image_url, show_id):
        try:
            buffers = []  # 생성된 모든 버퍼 객체 추적용
            parts = []    # 생성된 모든 이미지 조각 추적용

            print(f"🖼️ 이미지 처리 시작: {image_url}")
            
            # 이미지 다운로드
            response = requests.get(image_url)
            if response.status_code != 200:
                print(f"❌ 이미지 다운로드 실패: {response.status_code}")
                return None, None
                
            image_data = response.content
            
            # 이미지 로드
            img = Image.open(io.BytesIO(image_data))
            width, height = img.size
            print(f"✅ 이미지 크기: {width}x{height} 픽셀")
            
            # RGBA 모드 처리 - RGB로 변환
            if img.mode == 'RGBA':
                print("🔄 RGBA 이미지를 RGB로 변환 중...")
                # 흰색 배경 생성
                background = Image.new('RGB', img.size, (255, 255, 255))
                # 알파 채널을 고려하여 이미지 합성
                background.paste(img, mask=img.split()[3])  # 3은 알파 채널
                img = background

            full_text = ""
            print(f"DEBUG: 초기 full_text 길이 = {len(full_text)}")

            full_ocr_result = {                  
                "images": [                      
                    {                            
                        "fields": []             
                    }                            
                ]                                
            }                                    
            
            # 이미지가 큰 경우 분할 처리
            max_height = 5000
            overlap = 200
            
            if height <= max_height:
                # 작은 이미지는 그대로 처리
                buffer = io.BytesIO()
                buffers.append(buffer)

                # img.save(buffer, format="JPEG")
                img.convert('RGB').save(buffer, format="JPEG")
                part_data = buffer.getvalue()
                part_result = ImageProcessor.extract_text_with_ocr(part_data)
                part_text = ""

                if part_result and isinstance(part_result, dict) and "images" in part_result and part_result["images"]:
                    fields = part_result["images"][0].get("fields", [])

                    full_ocr_result["images"][0]["fields"] = fields

                    print(f"DEBUG: 작은 이미지 처리, fields 수: {len(fields)}")
                    field_count = 0

                    for field in fields:
                        if "inferText" in field:
                            part_text += field["inferText"] + " "
                            field_count += 1

                    print(f"DEBUG: 텍스트 추출 완료, 추출된 필드 수: {field_count}")
                    print(f"DEBUG: part_text 길이: {len(part_text)}")

                if part_text:
                    full_text += part_text
                    print(f"DEBUG: full_text 업데이트 후 길이: {len(full_text)}")

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
                    buffers.append(buffer)

                    # part.save(buffer, format="JPEG")
                    part.convert('RGB').save(buffer, format="JPEG")
                    part_data = buffer.getvalue()
                    
                    # OCR 처리
                    print(f"조각 {i+1}/{parts_count} OCR 처리 중...")
                    part_result = ImageProcessor.extract_text_with_ocr(part_data)

                    part_text = ""

                    if part_result and isinstance(part_result, dict) and "images" in part_result and part_result["images"]:
                        fields = part_result["images"][0].get("fields", [])

                    print(f"DEBUG OCR: part_result 타입 = {type(part_result)}")
                    print(f"DEBUG OCR: part_result 구조 = {json.dumps(part_result)[:200] if part_result else None}")


                    
                    if part_result and "images" in part_result and part_result["images"]:
                        fields = part_result["images"][0].get("fields", [])
                        print(f"DEBUG OCR: fields 개수 = {len(fields)}")

                        # if fields:
                        #     print(f"DEBUG OCR: 첫 번째 field = {json.dumps(fields[0])}")
                        
                        # 각 필드의 좌표를 원본 이미지 기준으로 변환
                        for field in fields:
                            if "boundingPoly" in field and "vertices" in field["boundingPoly"]:
                                for vertex in field["boundingPoly"]["vertices"]:
                                    if "y" in vertex:
                                        # y 좌표에 시작 위치 더하기
                                        vertex["y"] += start_y

                            if "inferText" in field:
                                part_text += field["inferText"] + " "
                        
                        # 변환된 필드를 결과에 추가
                        full_ocr_result["images"][0]["fields"].extend(fields)

                    if part_text:
                        full_text += part_text + " "
                        print(f"DEBUG: 조각 {i+1} 처리 후 full_text 길이: {len(full_text)}")
            
                print(f"✅ 모든 분할 처리 완료: {len(full_ocr_result['images'][0]['fields'])}개 텍스트 항목 추출") 
            
            # 모든 분할 처리 완료 후, OCR 결과에서 중복 제거 👈 (추가)
            if len(full_ocr_result["images"][0]["fields"]) > 0:
                print("OCR 결과에서 중복 항목 제거 중...")
                full_ocr_result["images"][0]["fields"] = ImageProcessor.remove_duplicate_text_fields(
                    full_ocr_result["images"][0]["fields"]
                )
                
            # S3 업로드 (원본 이미지)

            # RGB로 변환된 이미지를 JPEG으로 저장
            output_buffer = io.BytesIO()
            buffers.append(output_buffer)

            img.convert('RGB').save(output_buffer, format="JPEG")
            image_data_to_upload = output_buffer.getvalue()

            s3_key = f"chunks/notice_{show_id}.jpg"
            s3_url = ImageProcessor.upload_to_s3(image_data_to_upload, s3_key)

            try:
                # OCR 결과 파일 S3에 저장 (로컬 저장 제거) 👈
                s3_ocr_key = f"ocr_results/ocr_result_{show_id}.json"
                
                # JSON 문자열로 변환
                ocr_json_str = json.dumps(full_ocr_result, ensure_ascii=False, indent=2)
                
                # S3 클라이언트 생성
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=AWS_ACCESS_KEY,
                    aws_secret_access_key=AWS_SECRET_KEY,
                    region_name=S3_REGION
                )
                
                # S3에 업로드
                s3_client.put_object(
                    Body=ocr_json_str.encode('utf-8'),
                    Bucket=S3_BUCKET_NAME,
                    Key=s3_ocr_key,
                    ContentType='application/json; charset=utf-8'
                )
                
                print(f"✅ OCR 결과 S3 저장 완료: s3://{S3_BUCKET_NAME}/{s3_ocr_key}")
            except Exception as e:
                print(f"⚠️ OCR 결과 저장 중 오류 (무시됨): {str(e)}")

            print("🧹 메모리 정리 중...")
            del response, image_data

            for buf in buffers:
                buf.close()
            del buffers

            for part_img in parts:
                part_img.close()
            del parts

            img.close()
            del img

            gc.collect()
            print("✅ 메모리 정리 완료")

            return s3_url, full_text.strip()

            
        except Exception as e:
            print(f"❌ 이미지 처리 오류: {str(e)}")
            import traceback
            traceback.print_exc()
            return None, None

    @staticmethod
    def extract_text_with_ocr(image_data):
        """
        이미지 데이터에서 OCR 추출 (메모리 내 처리)
        
        Args:
            image_data: 이미지 바이트 데이터
            
        Returns:
            str: 추출된 텍스트
        """
        try:
            # OCR API 요청 준비
            request_json = {
                'images': [
                    {
                        'format': 'jpg',
                        'name': 'concert_notice',
                        'data': base64.b64encode(image_data).decode('utf-8')
                    }
                ],
                'requestId': str(uuid.uuid4()),
                'timestamp': int(round(time.time() * 1000)),
                'version': 'V2'
            }
            
            headers = {
                'X-OCR-SECRET': OCR_SECRET_KEY,
                'Content-Type': 'application/json',
                'X-NCP-APIGW-API-KEY-ID': OCR_API_KEY
            }
            
            # OCR API 호출
            print("🔍 OCR API 호출 중...")
            response = requests.post(OCR_API_URL, headers=headers, json=request_json)

             # 디버깅: 전체 응답 출력
            print(f"OCR 응답 상태 코드: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()

                print(f"✅ OCR 응답 성공 (데이터 크기: {len(str(result))}자)")
                return result  # 전체 JSON 객체 반환

            else:
                print(f"❌ OCR API 오류: {response.status_code} - {response.text}")
                return ""
        except Exception as e:
            print(f"❌ OCR 처리 오류: {str(e)}")
            import traceback
            traceback.print_exc()  # 상세 오류 정보 출력  
            return {
                "images": [
                    {
                        "fields": []
                    }
                ]
            }
    @staticmethod
    def upload_to_s3(file_data, s3_key):
        """
        파일 데이터를 S3에 업로드
        
        Args:
            file_data: 파일 바이트 데이터
            s3_key: S3에 저장될 경로와 파일명
            
        Returns:
            str: S3 URL
        """
        try:
            print(f"☁️ S3 업로드 중: {s3_key}")
            
            s3_client = boto3.client(
                's3',
                aws_access_key_id=AWS_ACCESS_KEY,
                aws_secret_access_key=AWS_SECRET_KEY,
                region_name=S3_REGION
            )
            
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=s3_key,
                Body=file_data,
                ContentType='image/jpeg'
            )
            
            # S3 URL 생성
            s3_url = f"https://{S3_BUCKET_NAME}.s3.{S3_REGION}.amazonaws.com/{s3_key}"
            print(f"✅ S3 업로드 완료: {s3_url}")
            return s3_url
            
        except Exception as e:
            print(f"❌ S3 업로드 오류: {str(e)}")
            return None
        

    # image_processor.py에 중복 제거 함수

    @staticmethod
    def remove_duplicate_text_fields(fields, overlap_threshold=20):
        """겹친 영역에서 발생한 중복 텍스트를 제거합니다."""
        if not fields:
            return fields
        
        print(f"중복 제거 전 필드 수: {len(fields)}")
        
        # y 좌표로 정렬
        sorted_fields = sorted(fields, key=lambda f: f["boundingPoly"]["vertices"][0]["y"])
        
        # 중복 제거 결과
        unique_fields = []
        duplicate_count = 0
        
        # 중복 확인에 사용된 텍스트 및 좌표 추적
        seen_items = {}  # {(text, y_approx): field}
        
        for field in sorted_fields:
            text = field.get("inferText", "")
            # 텍스트가 없으면 건너뛰기
            if not text.strip():
                continue
                
            # y 좌표 근사값 계산 (기준 단위로 반올림)
            y_coord = field["boundingPoly"]["vertices"][0]["y"]
            y_approx = round(y_coord / overlap_threshold) * overlap_threshold
            
            # 텍스트와 근사 y좌표로 키 생성
            item_key = (text, y_approx)
            
            # 이미 같은 텍스트와 비슷한 위치의 항목이 있는지 확인
            if item_key in seen_items:
                # 이미 본 항목의 y 좌표
                existing_y = seen_items[item_key]["boundingPoly"]["vertices"][0]["y"]
                
                # 실제 y 좌표 차이가 임계값 이내인지 확인
                if abs(existing_y - y_coord) <= overlap_threshold:
                    duplicate_count += 1
                    continue  # 중복으로 판단하여 건너뛰기
            
            # 중복이 아니면 추가
            seen_items[item_key] = field
            unique_fields.append(field)
        
        print(f"중복 제거 후 필드 수: {len(unique_fields)} (제거된 중복: {duplicate_count}개)")
        return unique_fields