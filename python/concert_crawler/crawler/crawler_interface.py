# crawler/crawler_interface.py
from abc import ABC, abstractmethod

class ConcertCrawlerInterface(ABC):
    """콘서트 크롤러 인터페이스"""
    
    @abstractmethod
    def crawl_concerts(self):
        """사이트에서 콘서트 목록을 크롤링"""
        pass
        
    @abstractmethod
    def get_concert_detail(self, concert_id, base_info=None):
        """콘서트 상세 정보와 공지사항 이미지 URL을 추출"""
        pass