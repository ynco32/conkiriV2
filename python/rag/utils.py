import os
import json
import logging

# 로깅 설정
logger = logging.getLogger(__name__)

def setup_logging(log_file=None):
    """로깅 설정을 초기화합니다."""
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(level=logging.INFO, format=log_format)
    
    # 파일 로깅 추가 (선택적)
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(logging.Formatter(log_format))
        logging.getLogger().addHandler(file_handler)

def save_json(data, file_path):
    """데이터를 JSON 파일로 저장합니다."""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"데이터가 '{file_path}'에 저장되었습니다.")
        return True
    except Exception as e:
        logger.error(f"JSON 저장 중 오류: {e}")
        return False

def load_json(file_path):
    """JSON 파일에서 데이터를 로드합니다."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f"'{file_path}'에서 데이터를 로드했습니다.")
        return data
    except Exception as e:
        logger.error(f"JSON 로드 중 오류: {e}")
        return None

def ensure_directory_exists(directory_path):
    """디렉토리가 존재하는지 확인하고, 없으면 생성합니다."""
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)
        logger.info(f"디렉토리 '{directory_path}'를 생성했습니다.")