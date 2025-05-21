import os
import json
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# 환경 변수 로드
load_dotenv()

# 로깅 설정
logger = logging.getLogger(__name__)

def group_paragraphs_with_gpt(paragraphs):
    """GPT를 사용하여 OCR 결과 문단들을 의미적으로 그룹화합니다."""
    
    # OpenAI API 키 가져오기
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")
    
    # ChatGPT 인스턴스 생성
    llm = ChatOpenAI(api_key=openai_api_key, model_name="gpt-4o", temperature=0.0)
    
    # 입력 문단들을 텍스트로 변환
    paragraphs_text = []
    for p in paragraphs:
        paragraphs_text.append(f"[top={p['top_y']}, bottom={p['bottom_y']}] {p['text']}")
    
    # 입력 문단들을 문자열로 결합
    paragraphs_str = "\n".join(paragraphs_text)
    
    prompt_text = f"""
다음은 OCR로 추출한 공지사항 문단들입니다. RAG 시스템에 효과적으로 저장하기 위해 의미적으로 같은 주제를 다루는 문단들을 그룹화하고 OCR 오류를 수정해주세요.

규칙:
1. 같은 주제나 정보를 다루는 문단들을 하나의 그룹으로 묶어주세요.
2. 한 그룹이 300자가 넘어가면 여러 개의 그룹으로 나눠주세요. 
3. 원본 내용을 누락하지 말고 모든 정보를 포함해주세요.
4. OCR 오류는 수정하되, 내용을 재구성하거나 요약하지 마세요.
5. 원본 의미는 그대로 유지해주세요.
6. 표 형태 데이터도 검색이 용이하도록 일반 텍스트로 변환하여 포함시키세요:
   * 예시: "본인 확인 가능한 유효 신분증: 주민등록증, 운전면허증, 여권, 청소년증, 외국인등록증 등"
7. 텍스트는 자연스러운 문장 형태로 유지하세요.
8. 각 그룹의 주제나 내용을 대표하는 카테고리를 지정해주세요 (예: 티켓 배송, 현장 수령, 신분증 정보)

문단 목록:
{paragraphs_str}

다음 JSON 형식으로 그룹화 결과를 반환해주세요:
[
  {{
    "text": "OCR 오류가 수정된 통합 텍스트 (표 데이터도 텍스트로 통합)",
    "metadata": {{
      "top_y": 그룹 내 가장 작은 top_y,
      "bottom_y": 그룹 내 가장 큰 bottom_y,
      "category": "이 그룹의 주제 카테고리"
    }}
  }},
  ...
]

JSON 형식으로만 응답해주세요. 다른 설명은 필요 없습니다.
"""
    
    # GPT에 요청 보내기
    logger.info("GPT에 문단 그룹화 요청을 보냅니다...")
    response = llm.invoke(prompt_text)
    
    try:
        # JSON 응답 파싱
        response_text = response.content
        
        # JSON 부분만 추출 (앞뒤 텍스트 제거 필요 시)
        if "```json" in response_text:
            json_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            json_text = response_text.split("```")[1].strip()
        else:
            json_text = response_text
            
        # JSON 파싱
        grouped_paragraphs = json.loads(json_text)
        logger.info(f"GPT에 의해 {len(grouped_paragraphs)}개의 그룹으로 분류되었습니다.")
        return grouped_paragraphs
    
    except Exception as e:
        logger.error(f"GPT 응답 파싱 오류: {e}")
        logger.error(f"GPT 원본 응답: {response.content}")
        
        # 오류 시 원본 문단들을 각각 하나의 그룹으로 반환
        fallback_groups = []
        for p in paragraphs:
            fallback_groups.append({
                "text": p["text"],
                "metadata": {
                    "top_y": p["top_y"],
                    "bottom_y": p["bottom_y"],
                    "category": "미분류"
                }
            })
        logger.warning("GPT 그룹화 실패로 각 문단을 개별 그룹으로 처리합니다.")
        return fallback_groups