import requests
from config import API_BASE_URL

def check_concert_exists(concert_name):
    """
    Java API를 호출하여 콘서트명으로 중복 확인
    
    Args:
        concert_name: 확인할 콘서트 이름
        
    Returns:
        bool: 이미 존재하면 True, 아니면 False
    """
    api_url = API_BASE_URL + "/api/v1/concerts/checkExists" 
    
    try:
        params = {"concertName": concert_name}
        response = requests.get(api_url, params=params)
        if response.status_code == 200:
            result = response.json()
            return result.get("data", False)
        else:
            error_message = (f"❌ API 호출 실패: {response.status_code} - {response.text}")
            print(error_message)
            raise ConnectionError(error_message)
    except requests.RequestException as e:
        error_message = f"❌ API 연결 오류: {str(e)}"
        print(error_message)
        raise ConnectionError(error_message)  # 연결 예외 시 ConnectionError로 변환
    except Exception as e:
        error_message = f"❌ 예상치 못한 오류: {str(e)}"
        print(error_message)
        raise ConnectionError(error_message)  # 기타 예외도 ConnectionError로 변환

def save_concert_to_java_api(concert_data):
    """콘서트 데이터를 Java API로 전송"""
    api_url = API_BASE_URL + "/api/v1/concerts/create"  # API 엔드포인트

    concert_name = concert_data.get('title') or concert_data.get('concert_name')
    venue_name = concert_data.get('place') or concert_data.get('venue')
    original_url = concert_data.get('reservation_link') or concert_data.get('detail_url')

    # 아티스트 리스트 확인 및 정규화
    artist_list = concert_data.get('artists', [])
    if not artist_list and 'artist' in concert_data and concert_data['artist']:
        artist_list = [concert_data['artist']]
    
    # 중첩 리스트 문제 해결 - 아티스트 리스트가 중첩되어 있는 경우 평탄화
    if isinstance(artist_list, list) and len(artist_list) > 0 and isinstance(artist_list[0], list):
        artist_list = artist_list[0]  # 첫 번째 내부 리스트만 사용
        print(f"⚠️ 중첩된 아티스트 리스트를 평탄화 했습니다: {artist_list}")
    
    # None이 아닌 빈 리스트로 설정
    if artist_list is None:
        artist_list = []
    # 문자열인 경우 리스트로 변환
    elif isinstance(artist_list, str):
        artist_list = [artist_list]

    notice_image_url = concert_data.get('s3_url')  # 먼저 s3_url 확인
    if not notice_image_url:
        notice_image_url = concert_data.get('notice_image_url')  # 없으면 원본 URL 사용


    ticketing_platform = concert_data.get('ticketing_platform', 'INTERPARK')
    
    request_data = {
        "concertName": concert_name,
        "artists": artist_list,
        "venueName": venue_name,
        "photoUrl": concert_data.get('poster_url'),
        "advanceReservation": concert_data.get('advance_reservation'),
        "reservation": concert_data.get('reservation'),
        "ticketingPlatform": ticketing_platform,
        "startTimes": concert_data.get('start_times', []),
        "noticeImageUrl": notice_image_url,
        "noticeText": concert_data.get('ocr_text'),
        "originalUrl": original_url
    }
    print("📡 API 요청 데이터:")
    import json
    print(json.dumps(request_data, indent=2, ensure_ascii=False, default=str))
    
    try:
        response = requests.post(api_url, json=request_data)
        if response.status_code == 200:
            result = response.json()
            concert_id = result.get('data')
            print(f"✅ 콘서트 저장 성공! ID: {concert_id}")
            return True
        else:
            print(f"❌ API 호출 실패: {response.status_code} - {response.text}")
            print(f"📊 전송 데이터 유형: {[f'{k}: {type(v)}' for k, v in request_data.items()]}")
            return False
    except Exception as e:
        print(f"❌ API 호출 오류: {str(e)}")
        return False