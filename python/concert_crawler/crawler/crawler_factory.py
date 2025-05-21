# crawler/crawler_factory.py
from crawler.interpark_crawler import InterparkCrawler
from crawler.melon_crawler import MelonCrawler
# from crawler.yes24_crawler import Yes24Crawler
# from crawler.coupang_crawler import CoupangCrawler

class CrawlerFactory:
    @staticmethod
    def get_crawler(site_name):
        """사이트명에 따른 적절한 크롤러 반환"""
        if site_name.lower() == "interpark":
            return InterparkCrawler()
        elif site_name.lower() == "melon":
            return MelonCrawler()
        # elif site_name.lower() == "yes24":
        #     return Yes24Crawler()
        # elif site_name.lower() == "coupang":
        #     return CoupangCrawler()
        else:
            raise ValueError(f"지원하지 않는 사이트: {site_name}")