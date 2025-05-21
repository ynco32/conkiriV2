import json
import logging
import os
import boto3
from config import S3_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_REGION


# 로깅 설정
logger = logging.getLogger(__name__)

def parse_paragraphs(raw, paragraph_gap=20):
    """OCR 결과에서 문단을 추출합니다."""
    logger.info("OCR 결과에서 문단 추출 시작")
    
    # 1) raw가 문자열이면 dict로 변환
    data = json.loads(raw) if isinstance(raw, str) else raw
    
    # 2) fields 추출
    img = data.get("images", [None])[0]
    if not img or "fields" not in img:
        raise ValueError("`images[0]['fields']`를 찾을 수 없습니다.")
    fields = img["fields"]
    
    # 3) y 기준 정렬
    fields.sort(key=lambda f: f["boundingPoly"]["vertices"][0]["y"])
    
    # 4) 줄 묶기 (lineBreak 기준)
    lines, cur_line = [], []
    for f in fields:
        text = f["inferText"]
        pt = f["boundingPoly"]["vertices"][0]
        cur_line.append((text, pt))
        if f.get("lineBreak", False):
            lines.append(cur_line)
            cur_line = []
    if cur_line:
        lines.append(cur_line)
    
    # 5) 단락 묶기 (줄 간격 기준)
    paragraphs, cur_para, prev_y = [], [], None
    for line in lines:
        line_y = min(pt["y"] for _, pt in line)
        if prev_y is not None and line_y - prev_y > paragraph_gap:
            paragraphs.append(cur_para)
            cur_para = []
        cur_para.append(line)
        prev_y = line_y
    if cur_para:
        paragraphs.append(cur_para)
    
    # 6) 결과 생성: text + top_y + bottom_y
    result = []
    for para in paragraphs:
        # 문단 텍스트
        texts = [" ".join(w for w, _ in line) for line in para]
        full_text = "\n".join(texts)
        # y 값만 모아서
        all_ys = [pt["y"] for line in para for _, pt in line]
        result.append({
            "text": full_text,
            "top_y": min(all_ys),
            "bottom_y": max(all_ys)
        })
    
    logger.info(f"총 {len(result)}개의 문단을 추출했습니다.")
    return result

def load_ocr_from_file(file_path_or_s3_key):
    """파일 또는 S3에서 OCR 결과를 로드합니다."""
    try:
        # S3 키인지 확인 (경로에 s3:// 포함 또는 파일이 존재하지 않는 경우)
        is_s3_path = file_path_or_s3_key.startswith('s3://') or not os.path.exists(file_path_or_s3_key)
        
        if is_s3_path:
            # S3 경로에서 버킷과 키 추출
            if file_path_or_s3_key.startswith('s3://'):
                # s3://bucket/key 형식 처리
                parts = file_path_or_s3_key.replace('s3://', '').split('/', 1)
                bucket = parts[0]
                key = parts[1] if len(parts) > 1 else ''
            else:
                # 단순 키 형식 (예: ocr_results/ocr_result_123.json)
                bucket = S3_BUCKET_NAME
                key = file_path_or_s3_key
                
                # 경로에 'ocr_results/'가 없으면 추가
                if not key.startswith('ocr_results/'):
                    # 파일 이름만 있는 경우 (예: ocr_result_123.json)
                    if '/' not in key:
                        key = f"ocr_results/{key}"
                    # show_id만 있는 경우 (예: 123)
                    elif key.isdigit():
                        key = f"ocr_results/ocr_result_{key}.json"
            
            logger.info(f"S3에서 OCR 결과 로드 중: 버킷={bucket}, 키={key}")
            
            # S3 클라이언트 생성
            s3_client = boto3.client(
                's3',
                aws_access_key_id=AWS_ACCESS_KEY,
                aws_secret_access_key=AWS_SECRET_KEY,
                region_name=S3_REGION
            )
            
            # S3에서 객체 가져오기
            response = s3_client.get_object(Bucket=bucket, Key=key)
            content = response['Body'].read().decode('utf-8')
            
            logger.info(f"S3에서 OCR 결과 로드 완료: {len(content)} 바이트")
            return json.loads(content)
        else:
            # 로컬 파일에서 로드 (기존 방식)
            logger.info(f"로컬 파일에서 OCR 결과 로드 중: {file_path_or_s3_key}")
            with open(file_path_or_s3_key, 'r', encoding='utf-8') as f:
                result = json.load(f)
            logger.info(f"로컬 파일에서 OCR 결과 로드 완료")
            return result
            
    except Exception as e:
        logger.error(f"OCR 결과 로드 중 오류: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise