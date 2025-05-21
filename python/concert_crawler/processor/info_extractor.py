import json
import re
from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI()  # .env의 OPENAI_API_KEY 사용

class ConcertInfoExtractor:
    @staticmethod
    def extract_info_via_gpt(text: str, base_info: dict = None) -> dict:
        print(f"text: {text}")
        print(f"base_info: {base_info}")    

        # 기본 정보가 있으면 프롬프트에 추가
        base_info_text = ""
        if base_info:
            base_info_text = f"""
이미 알고 있는 공연 기본 정보:
- 공연명: {base_info.get('title', '정보 없음')}
- 공연장: {base_info.get('place', '정보 없음')}
- 공연 기간: {base_info.get('date', '정보 없음')}
- 아티스트: {base_info.get('artist', '정보 없음')}
- 기타 정보: {base_info.get('content_text', '정보 없음')}
"""

        prompt = f"""
다음 텍스트에서 공연 정보를 추출해 정확한 JSON 형식으로만 반환해주세요.
반드시 아래 형식을 그대로 따라주세요:

{{
  "concert_name": "공연명 (없으면 null)",
  "venue": "공연장 (없으면 null)",
  "artist": ["아티스트 이름1", "아티스트 이름2", "..."](없으면 []),
  "advance_reservation": "선예매 시작일 (형식: 2025-05-01T12:00:00, 없으면 null)",
  "reservation": "일반 예매 시작일 (형식: 2025-05-01T12:00:00, 없으면 null)",
  "start_times": ["공연일시1(형식: 2025-05-01T19:00:00)", "공연일시2(형식: 2025-05-01T19:00:00)", "..."](없으면 [])
}}

중요:
1. 모든 날짜/시간은 "YYYY-MM-DDThh:mm:ss" ISO 형식으로 작성 (예: "2025-05-01T12:00:00")
2. 'T'로 날짜와 시간을 구분 (공백 아님)
3. start_times는 반드시 빈 배열 []이거나 시간 문자열 배열이어야 합니다.
4. artist는 반드시 배열 형태로 제공하세요. 아티스트가 한 명이면 ["아티스트 이름"], 여러 명이면 ["아티스트1", "아티스트2"]
5. 중복된 키는 절대 사용하지 마세요.
6. 공연 정보가 없거나 추론이 불가능하면 해당 필드는 null 또는 빈 배열
7. 반드시 유효한 JSON만 반환 (설명 없이)
8. 만약 예약 관련 날짜가 하나밖에 없다면 명시적으로 선예매라고 써 있지 않는 이상 reservation 필드에 넣어주세요.

{base_info_text}

텍스트:
{text}
"""

        try:
            # 최대 3번까지 시도
            for attempt in range(3):
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "너는 공연 정보를 추출하는 전문가야. 항상 정확한 JSON 형식으로만 응답해."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,  # 낮은 temperature로 더 일관된 출력
                )
                content = response.choices[0].message.content.strip()
                
                # JSON 블록 추출 시도
                json_match = re.search(r'```json\s*([\s\S]*?)\s*```', content)
                if json_match:
                    content = json_match.group(1).strip()
                
                # 시작과 끝에 있을 수 있는 불필요한 글자 제거
                content = re.sub(r'^[^{]*', '', content)
                content = re.sub(r'[^}]*$', '', content)
                
                print(f"\n========= GPT 응답 (시도 {attempt+1}) =========")
                print(content)
                
                try:
                    result = json.loads(content)
                    return result
                except json.JSONDecodeError as e:
                    print(f"❌ JSON 파싱 오류 (시도 {attempt+1}): {str(e)}")
                    if attempt == 2:  # 마지막 시도면 기본값 반환
                        return {
                            "concert_name": base_info.get('title') if base_info else None,
                            "venue": base_info.get('place') if base_info else None,
                            "artist": base_info.get('artist') if base_info and base_info.get('artist') else None,
                            "advance_reservation": None,
                            "reservation": None,
                            "start_times": []
                        }
                    
        except Exception as e:
            print(f"❌ GPT API 호출 오류: {str(e)}")
            # 오류 발생 시 기본 정보 반환
            return {
                "concert_name": base_info.get('title') if base_info else None,
                "venue": base_info.get('place') if base_info else None,
                "artist": base_info.get('artist') if base_info and base_info.get('artist') else None,
                "advance_reservation": None,
                "reservation": None,
                "start_times": []
            }