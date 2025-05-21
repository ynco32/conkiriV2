# main.py
import sys
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
from pipeline.concert_pipeline import ConcertPipeline
from crawler.crawler_factory import CrawlerFactory

def main():
    # 크롤링할 사이트 목록
    sites = ["interpark", "melon"] # "interpark", "melon", "yes24", "coupang" 나중에 추가
    
    for site in sites:
        try:
            print(f"\n=== {site.upper()} 공연 크롤링 시작 ===")
            
            # 1. 사이트에 맞는 크롤러 가져오기
            crawler = CrawlerFactory.get_crawler(site)
            
            # 2. 콘서트 목록 크롤링
            concerts = crawler.crawl_concerts()
            
            # 3. 각 콘서트 처리 (공통 파이프라인)
            for concert in concerts:
                try:
                    print(f"\n🔍 '{concert['title']}' 처리 중...")
                    ConcertPipeline.process_concert(crawler, concert)
                except ConnectionError as e:
                    print(f"⛔ API 연결 오류로 크롤링을 중단합니다: {str(e)}")
                    return
                except Exception as e:
                    print(f"❌ '{concert['title']}' 처리 중 오류 발생: {str(e)}")
                
        except Exception as e:
            print(f"❌ {site} 크롤링 중 오류 발생: {str(e)}")
    
    print("\n🎉 모든 사이트 크롤링 완료!")

if __name__ == "__main__":
    main()