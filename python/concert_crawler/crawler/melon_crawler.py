# crawler/melon_crawler.py
import time
import random
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from config import HEADERS, FILTERED_VENUES
from crawler.crawler_interface import ConcertCrawlerInterface

class MelonCrawler(ConcertCrawlerInterface):
    """멜론티켓 크롤러 클래스 - 스크롤 기능 추가"""
    
    def __init__(self):
        self.base_url = "https://ticket.melon.com/concert/index.htm"
        self.seen_ids = set()  # 이미 수집한 공연 ID를 저장하는 세트
        
    def crawl_concerts(self):
        """멜론티켓 콘서트 목록 크롤링 - 스크롤 기능 추가"""
        all_concerts = []
        
        print(f"\n=== 멜론티켓 콘서트 목록 크롤링 시작 ===")
        
        # Selenium 설정
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')  # 자동화 감지 방지
        options.add_argument(f'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36')
        
        driver = None
        
        try:
            driver = webdriver.Chrome(options=options)
            
            # 멜론티켓 콘서트 페이지 접속
            url = f"{self.base_url}?genreType=GENRE_CON"
            print(f"🌐 페이지 접속 중: {url}")
            driver.get(url)
            
            # 페이지 로딩 대기
            time.sleep(3)
            
            # 앨범형 보기 선택 (이미 선택되어 있을 수도 있음)
            try:
                album_buttons = driver.find_elements(By.CSS_SELECTOR, ".tappingBtn")
                if len(album_buttons) >= 2:
                    album_view_button = album_buttons[1]  # 두 번째 버튼(앨범형)
                    if 'on' not in album_view_button.get_attribute("class"):
                        album_view_button.click()
                        time.sleep(2)
            except Exception as e:
                print(f"앨범형 뷰 선택 중 오류 (무시 가능): {str(e)}")
            
            # 스크롤 함수 정의
            def scroll_page():
                last_height = driver.execute_script("return document.body.scrollHeight")
                
                # 스크롤 다운
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                
                # 페이지 로딩 대기
                time.sleep(random.uniform(2, 3))
                
                # 새 스크롤 높이와 이전 스크롤 높이 비교
                new_height = driver.execute_script("return document.body.scrollHeight")
                
                return new_height != last_height  # True이면 더 스크롤 가능
            
            # 처음에 모든 콘서트를 로드하기 위해 페이지 끝까지 스크롤
            print("📜 콘텐츠 로딩을 위해 스크롤 중...")
            scroll_count = 0
            max_scrolls = 10  # 최대 스크롤 횟수 제한 (필요에 따라 조정)
            
            # 여러 번 스크롤하여 모든 콘텐츠 로드
            while scroll_count < max_scrolls:
                has_more = scroll_page()
                scroll_count += 1
                print(f"  스크롤 {scroll_count}/{max_scrolls} 완료")
                
                if not has_more:
                    print("  더 이상 스크롤할 수 없습니다 (페이지 끝)")
                    break
            
            # 모든 콘서트 항목 수집
            print("🔍 로드된 콘서트 정보 수집 중...")
            concert_items = driver.find_elements(By.CSS_SELECTOR, "ul.list_main_concert.tapping.on li")
            
            # 빈 항목 필터링
            valid_items = [item for item in concert_items if item.find_elements(By.CSS_SELECTOR, "a.inner")]
            
            print(f"📄 총 {len(valid_items)}개의 공연 정보 발견")
            
            # 각 콘서트 항목에서 정보 추출
            for item in valid_items:
                try:
                    # 내부 링크 찾기
                    link_element = item.find_element(By.CSS_SELECTOR, "a.inner")
                    
                    # 링크에서 공연 ID 추출
                    link = link_element.get_attribute("href")
                    prod_id_match = re.search(r"prodId=(\d+)", link)
                    
                    if not prod_id_match:
                        continue
                    
                    prod_id = prod_id_match.group(1)
                    
                    # 이미 수집한 ID면 건너뛰기
                    if prod_id in self.seen_ids:
                        continue
                    
                    self.seen_ids.add(prod_id)
                    
                    # 제목 추출
                    title_element = item.find_element(By.CSS_SELECTOR, "strong.tit")
                    title = title_element.text.strip() if title_element else "제목 없음"
                    
                    # 날짜 정보 추출
                    date_element = item.find_element(By.CSS_SELECTOR, "span.day")
                    date = date_element.text.strip() if date_element else "날짜 없음"
                    
                    # 장소 추출
                    place_element = item.find_element(By.CSS_SELECTOR, "span.location")
                    place = place_element.text.strip() if place_element else "장소 없음"
                    
                    # 포스터 이미지 URL 추출
                    poster_element = item.find_element(By.CSS_SELECTOR, "span.thumb img")
                    poster_img = poster_element.get_attribute("src") if poster_element else None
                    
                    # 특정 공연장 필터링
                    if any(keyword in place for keyword in FILTERED_VENUES):
                        detail_url = f"https://ticket.melon.com/performance/index.htm?prodId={prod_id}"
                        
                        concert_data = {
                            'title': title,
                            'place': place,
                            'date': date,
                            'artist': None,  # 상세 페이지에서 가져와야 함
                            'poster_url': poster_img,
                            'detail_url': detail_url,
                            'show_id': prod_id
                        }
                        
                        all_concerts.append(concert_data)
                        
                        print(f"🎟️ 공연명: {title}")
                        print(f"📍 장소: {place}")
                        print(f"🗓️ 일시: {date}")
                        print(f"🔗 상세페이지: {detail_url}")
                        print("-" * 50)
                except Exception as e:
                    print(f"⚠️ 항목 처리 중 오류: {str(e)}")
                    continue
            
            print(f"\n전체 {len(all_concerts)}개의 공연 정보를 추출했습니다.")
            return all_concerts
            
        except Exception as e:
            print(f"❌ 멜론티켓 크롤링 중 오류 발생: {str(e)}")
            import traceback
            traceback.print_exc()  # 상세 오류 정보 출력
            return []
            
        finally:
            if driver:
                driver.quit()
            
    def get_concert_detail(self, show_id, base_info=None):
        """
        멜론티켓 공연 상세 정보 및 공지사항 이미지 URL을 추출
        
        Args:
            show_id (str): 공연 ID
            base_info (dict): 기본 공연 정보 
                            {'title', 'place', 'date', 'artist', 'poster_url', 'detail_url', 'show_id'}
            
        Returns:
            dict: 크롤링 결과 정보
                {'title', 'place', 'date', 'artist', 'advance_reservation', 'reservation', 
                'ticketing_platform', 'start_times', 'notice_image_url', 'ocr_text', ...}
        """
        detail_info = {}
        detail_url = f"https://ticket.melon.com/performance/index.htm?prodId={show_id}"
        
        if base_info:
            detail_info.update(base_info)
        
        # Selenium 설정
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')  # 자동화 감지 방지
        options.add_argument(f'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36')
        
        driver = None
        
        try:
            print(f"🌐 상세 페이지 접속 중: {detail_url}")
            driver = webdriver.Chrome(options=options)
            driver.get(detail_url)
            
            # 페이지 로딩 대기
            time.sleep(3)
            
            # 티켓 오픈 상태 확인
            is_ticket_open = False
            ticket_open_date = None
            
            try:
                # 티켓팅 상태 확인
                ticket_process_box = driver.find_element(By.ID, "ticketing_process_box")
                box_tkt_txt = ticket_process_box.find_element(By.ID, "box_tkt_txt")
                
                # 티켓 오픈 예정일 텍스트가 있는지 확인
                if "티켓오픈" in box_tkt_txt.text:
                    # 티켓 오픈 예정
                    is_ticket_open = False
                    ticket_open_date = box_tkt_txt.text.strip()
                    print(f"📅 티켓 오픈 예정: {ticket_open_date}")
                    detail_info['ticket_status'] = "예정"
                    detail_info['ticket_open_date'] = ticket_open_date
                else:
                    # 티켓 이미 오픈됨
                    is_ticket_open = True
                    detail_info['ticket_status'] = "오픈"
            except Exception as e:
                print(f"티켓 오픈 상태 확인 중 오류 (무시 가능): {str(e)}")
            
            # 출연진 정보 추출
            artists = []
            try:
                artist_elements = driver.find_elements(By.CSS_SELECTOR, "ul.list_artist li")
                for artist_elem in artist_elements:
                    # no_artist 클래스가 있는 항목은 실제 아티스트가 아니므로 제외
                    if "no_artist" not in artist_elem.get_attribute("class"):
                        artist_name_elem = artist_elem.find_element(By.CSS_SELECTOR, "strong.singer")
                        if artist_name_elem and artist_name_elem.text.strip():
                            artists.append(artist_name_elem.text.strip())
                
                if artists:
                    if 'artist' not in detail_info or not detail_info['artist']:
                        detail_info['artist'] = artists[0]  # 첫 번째 아티스트를 대표 아티스트로 설정
                    detail_info['artists'] = artists  # 전체 아티스트 목록도 저장
                    print(f"👥 출연진: {', '.join(artists)}")
            except Exception as e:
                print(f"출연진 정보 추출 중 오류 (무시 가능): {str(e)}")
            
            # 공연 일시 정보 추출
            try:
                concert_time_elem = driver.find_element(By.CSS_SELECTOR, ".box_concert_time")
                if concert_time_elem:
                    concert_time_text = concert_time_elem.text.strip()
                    detail_info['concert_time_info'] = concert_time_text
                    print(f"🕒 공연 시간 정보: {concert_time_text}")
                    
                    # 공연 날짜 패턴 추출
                    date_pattern = r'(\d{4})년\s*(\d+)월\s*(\d+)일\s*\(([^\)]+)\)\s*~\s*(\d+)월\s*(\d+)일|(\d{4})년\s*(\d+)월\s*(\d+)일'
                    date_matches = re.findall(date_pattern, concert_time_text)
                    
                    # 시간 패턴 추출
                    time_pattern = r'(오전|오후)\s*(\d+)시\s*(\d+)?분?'
                    time_matches = re.findall(time_pattern, concert_time_text)
                    
                    start_times = []
                    
                    # 공연 시작 시간 구성
                    if date_matches:
                        # 여러 날짜와 시간이 있는 경우 처리
                        if len(date_matches[0]) > 6 and date_matches[0][0]:  # 범위 형식 (2025년 5월 23일(금) ~ 5월 25일)
                            year = date_matches[0][0]
                            start_month = int(date_matches[0][1])
                            start_day = int(date_matches[0][2])
                            end_month = int(date_matches[0][4])
                            end_day = int(date_matches[0][5])
                            
                            # 시작일과 종료일 사이의 모든 날짜 계산
                            from datetime import datetime, timedelta
                            start_date = datetime(int(year), start_month, start_day)
                            end_date = datetime(int(year), end_month, end_day)
                            delta = timedelta(days=1)
                            
                            # 날짜별 시간 매핑
                            date_time_mapping = {}
                            weekday_names = ["월", "화", "수", "목", "금", "토", "일"]
                            
                            # 요일별 시간 추출 (예: "금 오후 7시 / 토 오후 6시 / 일 오후 5시 25분")
                            weekday_time_pattern = r'([월화수목금토일])\s*(오전|오후)\s*(\d+)시(?:\s*(\d+)분)?'
                            weekday_time_matches = re.findall(weekday_time_pattern, concert_time_text)
                            
                            for weekday, am_pm, hour, minute in weekday_time_matches:
                                weekday_idx = weekday_names.index(weekday)
                                hour_24 = int(hour)
                                if am_pm == "오후" and hour_24 < 12:
                                    hour_24 += 12
                                minute_val = int(minute) if minute else 0
                                date_time_mapping[weekday_idx] = (hour_24, minute_val)
                            
                            # 시작일부터 종료일까지 순회하며 시간 정보 추가
                            current_date = start_date
                            while current_date <= end_date:
                                weekday_idx = current_date.weekday()
                                if weekday_idx in date_time_mapping:
                                    hour, minute = date_time_mapping[weekday_idx]
                                    time_str = f"{current_date.year}-{current_date.month:02d}-{current_date.day:02d}T{hour:02d}:{minute:02d}:00"
                                    start_times.append(time_str)
                                current_date += delta
                        
                        elif len(date_matches[0]) > 6 and date_matches[0][6]:  # 단일 날짜 형식 (2025년 5월 23일)
                            year = date_matches[0][6]
                            month = int(date_matches[0][7])
                            day = int(date_matches[0][8])
                            
                            # 시간 정보가 있으면 추가
                            if time_matches:
                                for am_pm, hour, minute in time_matches:
                                    hour_24 = int(hour)
                                    if am_pm == "오후" and hour_24 < 12:
                                        hour_24 += 12
                                    minute_val = int(minute) if minute else 0
                                    time_str = f"{year}-{month:02d}-{day:02d}T{hour_24:02d}:{minute_val:02d}:00"
                                    start_times.append(time_str)
                    
                    if start_times:
                        detail_info['start_times'] = start_times
                        print(f"📅 공연 시작 시간: {start_times}")
            except Exception as e:
                print(f"공연 시간 정보 추출 중 오류 (무시 가능): {str(e)}")
            
            # 티켓팅 플랫폼 설정
            detail_info['ticketing_platform'] = "MELON"
            
            # 예매 공지사항 및 선예매 정보 추출
            try:
                notice_elem = driver.find_element(By.CSS_SELECTOR, ".box_ticke_notice")
                if notice_elem:
                    notice_text = notice_elem.text.strip()
                    detail_info['ocr_text'] = notice_text  # 공지사항 텍스트 (info_extractor와 동일한 필드 사용)
                    print(f"📝 예매 공지사항 추출 (일부): {notice_text[:100]}...")
                    
                    # 선예매/일반예매 날짜 패턴 추출
                    advance_pattern = r'선예매[^\d]*(20\d{2})년\s*(\d+)월\s*(\d+)일\([^\)]+\)\s*(?:오[전후]\s*(\d+)[시:](\d+)|오[전후]\s*(\d+)[시:]|(\d+)[시:](\d+)|(\d+)[시:])'
                    general_pattern = r'일반예매[^\d]*(20\d{2})년\s*(\d+)월\s*(\d+)일\([^\)]+\)\s*(?:오[전후]\s*(\d+)[시:](\d+)|오[전후]\s*(\d+)[시:]|(\d+)[시:](\d+)|(\d+)[시:])'
                    
                    advance_matches = re.search(advance_pattern, notice_text)
                    general_matches = re.search(general_pattern, notice_text)
                    
                    # 선예매 날짜 처리
                    if advance_matches:
                        adv_groups = advance_matches.groups()
                        year = adv_groups[0]
                        month = int(adv_groups[1])
                        day = int(adv_groups[2])
                        
                        # 시간 정보 추출 (다양한 패턴 처리)
                        hour = 0
                        minute = 0
                        
                        if adv_groups[3] and adv_groups[4]:  # 오전/오후 시:분 형식
                            hour = int(adv_groups[3])
                            minute = int(adv_groups[4])
                            if "오후" in advance_matches.group() and hour < 12:
                                hour += 12
                        elif adv_groups[5]:  # 오전/오후 시 형식
                            hour = int(adv_groups[5])
                            if "오후" in advance_matches.group() and hour < 12:
                                hour += 12
                        elif adv_groups[6] and adv_groups[7]:  # 시:분 형식
                            hour = int(adv_groups[6])
                            minute = int(adv_groups[7])
                            if hour < 12 and "오후" in advance_matches.group():
                                hour += 12
                        elif adv_groups[8]:  # 시 형식
                            hour = int(adv_groups[8])
                            if hour < 12 and "오후" in advance_matches.group():
                                hour += 12
                        
                        advance_reservation = f"{year}-{month:02d}-{day:02d}T{hour:02d}:{minute:02d}:00"
                        detail_info['advance_reservation'] = advance_reservation
                        print(f"🎫 선예매 일시: {advance_reservation}")
                    
                    # 일반예매 날짜 처리
                    if general_matches:
                        gen_groups = general_matches.groups()
                        year = gen_groups[0]
                        month = int(gen_groups[1])
                        day = int(gen_groups[2])
                        
                        # 시간 정보 추출 (다양한 패턴 처리)
                        hour = 0
                        minute = 0
                        
                        if gen_groups[3] and gen_groups[4]:  # 오전/오후 시:분 형식
                            hour = int(gen_groups[3])
                            minute = int(gen_groups[4])
                            if "오후" in general_matches.group() and hour < 12:
                                hour += 12
                        elif gen_groups[5]:  # 오전/오후 시 형식
                            hour = int(gen_groups[5])
                            if "오후" in general_matches.group() and hour < 12:
                                hour += 12
                        elif gen_groups[6] and gen_groups[7]:  # 시:분 형식
                            hour = int(gen_groups[6])
                            minute = int(gen_groups[7])
                            if hour < 12 and "오후" in general_matches.group():
                                hour += 12
                        elif gen_groups[8]:  # 시 형식
                            hour = int(gen_groups[8])
                            if hour < 12 and "오후" in general_matches.group():
                                hour += 12
                        
                        reservation = f"{year}-{month:02d}-{day:02d}T{hour:02d}:{minute:02d}:00"
                        detail_info['reservation'] = reservation
                        print(f"🎟️ 일반예매 일시: {reservation}")
                    
                    # 더 단순한 패턴도 추가 (티켓오픈 패턴)
                    ticket_open_pattern = r'티켓\s*오픈[^\d]*(20\d{2})년\s*(\d+)월\s*(\d+)일\s*\([^\)]+\)\s*오(전|후)\s*(\d+)[시:]'
                    ticket_open_matches = re.search(ticket_open_pattern, notice_text)
                    
                    if ticket_open_matches and not general_matches:
                        year = ticket_open_matches.group(1)
                        month = int(ticket_open_matches.group(2))
                        day = int(ticket_open_matches.group(3))
                        am_pm = ticket_open_matches.group(4)
                        hour = int(ticket_open_matches.group(5))
                        
                        if am_pm == "후" and hour < 12:
                            hour += 12
                        
                        reservation = f"{year}-{month:02d}-{day:02d}T{hour:02d}:00:00"
                        detail_info['reservation'] = reservation
                        print(f"🎟️ 티켓오픈 일시: {reservation}")
            except Exception as e:
                print(f"예매 공지사항 추출 중 오류 (무시 가능): {str(e)}")
                import traceback
                traceback.print_exc()
            
            # 작품 설명에서 공지 이미지 추출 - 이 부분이 중요함!
            try:
                img_content = driver.find_element(By.CSS_SELECTOR, ".box_img_content")
                if img_content:
                    # 작품설명 아래의 이미지들 추출
                    content_images = img_content.find_elements(By.CSS_SELECTOR, "img")
                    
                    if content_images:
                        # 멜론티켓은 항상 첫 번째 이미지를 실제 공지 이미지로 사용
                        notice_image_url = content_images[0].get_attribute("src")
                        detail_info['notice_image_url'] = notice_image_url
                        print(f"🖼️ 공지사항 이미지 URL: {notice_image_url}")
            except Exception as e:
                print(f"작품 설명 이미지 추출 중 오류 (무시 가능): {str(e)}")
                
            return detail_info
        
        except Exception as e:
            print(f"❌ 상세 정보 추출 중 오류 발생: {str(e)}")
            import traceback
            traceback.print_exc()  # 상세 오류 정보 출력
            return detail_info
        
        finally:
            if driver:
                driver.quit()