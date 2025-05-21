import requests
from bs4 import BeautifulSoup
import re
import time
import random
from config import INTERPARK_BASE_URL, HEADERS, FILTERED_VENUES
from config import DETAIL_URL_TEMPLATE, HEADERS, TEMP_IMAGE_DIR 
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# crawler/interpark_crawler.py
from crawler.crawler_interface import ConcertCrawlerInterface

class InterparkCrawler(ConcertCrawlerInterface):
    def __init__(self):
        # 인터파크 콘서트 목록 크롤링
        self.seen_ids = set()
        self.duplicate_pages = 0
        self.MAX_DUPLICATE_PAGES = 3
    
    def get_concerts_from_page(self, page):
        """특정 페이지에서 공연 정보 목록 추출"""
        params = {
            "sReqMainCategory": "000003",  # 콘서트 카테고리
            "Page": page
        }
        
        res = requests.get(INTERPARK_BASE_URL, headers=HEADERS, params=params)
        soup = BeautifulSoup(res.text, "html.parser")
        show_blocks = soup.select("td[width='375']")
        
        if not show_blocks:
            return [], False
        
        new_data_found = False
        concerts = []
        
        print(f"\n📄 {page}페이지 ({len(show_blocks)}개 공연)\n")
        
        for block in show_blocks:
            a_tag = block.find("a", href="#")
            title = a_tag.text.strip() if a_tag else "제목 없음"
            onclick = a_tag.get("onclick", "")
            match = re.search(r"goDetail\('(\d+)'\)", onclick)
            show_id = match.group(1) if match else None
            
            # 중복 공연은 건너뛰기
            if show_id is None or show_id in self.seen_ids:
                continue
            
            self.seen_ids.add(show_id)
            new_data_found = True
            
            text = block.get_text(separator=" ", strip=True)
            date_match = re.search(r"일시\s*:\s*([0-9.\s~]+)", text)
            place_tag = block.find("a", href=re.compile("PlacedbInfo.asp"))
            artist_tags = block.find_all("a", href=re.compile("artistdb/detail.asp"))
            artists = [a.text.strip() for a in artist_tags]
            artist_text = ", ".join(artists) if artists else "출연자 정보 없음"
            poster_td = block.find_previous_sibling("td", attrs={"width": "90"})
            poster_img = poster_td.find("img")["src"] if poster_td and poster_td.find("img") else "포스터 없음"
            
            date = date_match.group(1).strip() if date_match else "날짜 없음"
            place = place_tag.text.strip() if place_tag else "장소 없음"
            
            detail_url = f"http://www.playdb.co.kr/playdb/playdbdetail.asp?sReqPlayNo={show_id}"
            
            # 특정 공연장 필터링
            if any(keyword in place for keyword in FILTERED_VENUES):
                concert_data = {
                    'title': title,
                    'place': place,
                    'date': date,
                    'artist': artists[0] if artists else None,
                    'poster_url': poster_img if poster_img != "포스터 없음" else None,
                    'detail_url': detail_url,
                    'show_id': show_id
                }
                
                concerts.append(concert_data)
                
                print(f"🎟️ 공연명: {title}")
                print(f"📍 장소: {place}")
                print(f"🗓️ 일시: {date}")
                print(f"👤 출연: {artist_text}")
                print(f"🔗 상세페이지: {detail_url}")
                print("-" * 50)
                
        
        return concerts, new_data_found
    
    def crawl_concerts(self):
        """페이지별로 공연 정보 수집"""
        page = 1
        all_concerts = []
        
        while True:
            concerts, new_data_found = self.get_concerts_from_page(page)
            
            if not concerts:
                print(f"\n🛑 공연이 더 이상 없습니다. (페이지 {page})")
                break
            
            all_concerts.extend(concerts)
            
            # 중복된 공연만 있던 페이지가 계속 나오면 중단
            if not new_data_found:
                self.duplicate_pages += 1
                if self.duplicate_pages >= self.MAX_DUPLICATE_PAGES:
                    print("\n🛑 더 이상 새로운 공연이 없습니다. 크롤링 종료.")
                    break
            else:
                self.duplicate_pages = 0  # 새 데이터가 있었으면 초기화
            
            page += 1
        
        print(f"\n전체 {len(all_concerts)}개의 공연 정보를 추출했습니다.")
        return all_concerts

    def get_concert_detail(self, show_id, base_info=None):
        # 인터파크 상세 페이지 크롤링 (notice_image_crawler.py 중 인터파크 부분)
        # 이미지 URL만 추출하여 반환
        detail_url = DETAIL_URL_TEMPLATE.format(show_id)
        
        # 셀레니움 설정
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')  # 자동화 감지 방지
        options.add_argument(f'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36')
        
        driver = None
        
        try:
            driver = webdriver.Chrome(options=options)
            
            # 1. 먼저 상세 페이지에서 예매 버튼 링크 찾기
            driver.get(detail_url)
            time.sleep(random.uniform(2, 3))  # 인간 행동 시뮬레이션
            
            # 예매하기 버튼 링크 찾기
            reservation_link = None
            try:
                reservation_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//img[contains(@src, 'btn_reserve.gif')]/parent::a"))
                )
                reservation_link = reservation_button.get_attribute('href')
                print(f"🎫 예매 링크 발견: {reservation_link}")
            except Exception as e:
                print(f"❌ 예매 링크를 찾을 수 없습니다: {str(e)}")
                return {}
            
            # 티켓팅 플랫폼 확인
            ticketing_platform = "INTERPARK" 
            
            detail_info = {
                'reservation_link': reservation_link,
                'ticketing_platform': ticketing_platform
            }
            

            # 2. 예매 페이지로 이동하여 공지사항 이미지 및 정보 수집
            driver.get(reservation_link)
            time.sleep(random.uniform(4, 6)) 
            
            # 1. 전체 콘텐츠 영역에서 텍스트 추출 (간소화)
            try:
                # 콘텐츠 영역 전체 선택 (prdContents 클래스)
                content_div = driver.find_element(By.CSS_SELECTOR, 'div.prdContents.detail')
                if content_div:
                    full_text = content_div.text
                    # 전체 텍스트 저장 (GPT가 알아서 분석할 수 있도록)
                    detail_info['content_text'] = full_text
                    print(f"✅ 콘텐츠 텍스트 추출 성공 ({len(full_text)} 자)")
            except Exception as e:
                print(f"❌ 콘텐츠 텍스트 추출 실패: {str(e)}")
            
            # 2. 공지사항 이미지 후보 추출 - 개선된 방식
            notice_image_candidates = []
            
            # 2.1 공연상세/출연진정보 섹션에서 이미지 찾기 (주요 공지 이미지가 있는 곳)
            try:
                # 공연상세/출연진정보 제목 찾기
                description_title = driver.find_element(By.XPATH, "//h3[contains(text(), '공연상세') or contains(text(), '출연진정보')]")
                if description_title:
                    # 해당 제목 아래의 div에서 이미지 찾기
                    description_section = description_title.find_element(By.XPATH, "./following-sibling::div[1]")
                    
                    if description_section:
                        images = description_section.find_elements(By.TAG_NAME, "img")
                        for idx, img in enumerate(images):
                            src = img.get_attribute('src')
                            if src:
                                # 첫 번째 이미지에 가장 높은 우선순위 부여
                                priority = 1 if idx == 0 else 2
                                notice_image_candidates.append({
                                    'src': src,
                                    'priority': priority,
                                    'width': img.get_attribute('width') or img.get_attribute('style') or '0',
                                    'element': img
                                })
                                print(f"공연상세 섹션에서 이미지 발견: {src} (우선순위: {priority})")
            except Exception as e:
                print(f"공연상세 섹션 검색 중 오류: {str(e)}")
            
            # 2.2 기본 이미지 검색 (모든 티켓 이미지)
            all_images = driver.find_elements(By.TAG_NAME, "img")
            for img in all_images:
                src = img.get_attribute('src')
                if not src:
                    continue
                    
                # 이미 후보에 포함된 이미지는 건너뛰기
                if any(candidate['src'] == src for candidate in notice_image_candidates):
                    continue
                    
                # ticketimage.interpark.com 도메인의 이미지를 찾음
                if 'ticketimage.interpark.com' in src:
                    # 패턴 분석: URL 구조로 우선순위 결정
                    priority = 5  # 기본 우선순위
                    
                    # 패턴 1: /Play/image/etc/ 경로 (공지사항 이미지에 자주 사용)
                    if '/Play/image/etc/' in src:
                        priority = 3
                    
                    # 패턴 2: 연도/월/일/ 형식 (예: 2025/04/18/)
                    elif re.search(r'/\d+/\d+/\d+/', src) or re.search(r'\d{8,}', src):
                        priority = 3
                        
                    # 스타일 및 크기 확인 (넓은 이미지 우선)
                    width_value = 0
                    style = img.get_attribute('style') or ''
                    width_attr = img.get_attribute('width') or '0'
                    
                    # width="100%" 또는 style="width: 100%" 확인
                    if width_attr == '100%' or 'width: 100%' in style:
                        width_value = 100
                        priority -= 1  # 더 높은 우선순위 부여
                    
                    notice_image_candidates.append({
                        'src': src,
                        'priority': priority,
                        'width': width_value,
                        'element': img
                    })
                    print(f"이미지 후보: {src} (우선순위: {priority})")
            
            # 3. 이미지 후보 중에서 최적의 이미지 선택
            if notice_image_candidates:
                # 우선순위 > 크기 > 상세 페이지에 먼저 나타나는 순서
                notice_image_candidates.sort(key=lambda x: (
                    x['priority'],  # 우선순위 낮은 숫자가 높은 우선순위
                    -int(x['width']) if isinstance(x['width'], int) else 0,  # 너비 큰 순
                    0  # 기본 순서 유지
                ))
                
                # 최적의 이미지 선택
                selected_img_src = notice_image_candidates[0]['src']
                print(f"🖼️ 최적의 공지사항 이미지 선택됨: {selected_img_src}")
                
                # 이미지 URL 정규화
                if selected_img_src.startswith('//'):
                    img_url = f"https:{selected_img_src}"
                elif not selected_img_src.startswith('http'):
                    img_url = f"https://ticketimage.interpark.com{selected_img_src}"
                else:
                    img_url = selected_img_src
                
                detail_info['notice_image_url'] = img_url
            else:
                print("❌ 적합한 공지사항 이미지를 찾을 수 없습니다.")
            
            return detail_info
            
        except Exception as e:
            print(f"❌ 상세 정보 추출 오류: {str(e)}")
            return detail_info
        
        finally:
            if driver:
                driver.quit()