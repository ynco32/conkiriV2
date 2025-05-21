import { useState, useRef, useEffect, MutableRefObject } from 'react';

interface UseImageScrollerReturn {
  photoScrollerRef: MutableRefObject<HTMLDivElement | null>;
  activePhotoIndex: number;
  isDragging: boolean;
  scrollToPhoto: (index: number) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleDragEnd: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

export const useImageScroller = (
  photoCount: number
): UseImageScrollerReturn => {
  const photoScrollerRef = useRef<HTMLDivElement>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  // 현재 활성화된 사진 인덱스 업데이트 (스크롤 위치에 따라)
  const updateActivePhotoIndex = () => {
    if (!photoScrollerRef.current) return;

    const scrollPosition = photoScrollerRef.current.scrollLeft;
    const containerWidth = photoScrollerRef.current.clientWidth;
    const newIndex = Math.round(scrollPosition / containerWidth);

    // 범위 확인 (0 ~ photoCount-1)
    const boundedIndex = Math.max(0, Math.min(photoCount - 1, newIndex));

    if (boundedIndex !== activePhotoIndex) {
      setActivePhotoIndex(boundedIndex);
    }
  };

  // 사진 인디케이터 클릭 시 해당 사진으로 스크롤
  const scrollToPhoto = (index: number) => {
    if (!photoScrollerRef.current) return;

    const containerWidth = photoScrollerRef.current.clientWidth;
    photoScrollerRef.current.scrollTo({
      left: index * containerWidth,
      behavior: 'smooth',
    });

    setActivePhotoIndex(index);
  };

  // 드래그 시작 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!photoScrollerRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - photoScrollerRef.current.offsetLeft);
    setScrollLeft(photoScrollerRef.current.scrollLeft);

    // 드래그 중에 텍스트 선택 방지
    document.body.style.userSelect = 'none';
  };

  // 드래그 중 핸들러
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !photoScrollerRef.current) return;

    e.preventDefault();
    const x = e.pageX - photoScrollerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // 스크롤 속도 조절 (1.5)
    photoScrollerRef.current.scrollLeft = scrollLeft - walk;
  };

  // 터치 시작 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!photoScrollerRef.current) return;

    setIsDragging(true);
    setTouchStartX(e.touches[0].pageX - photoScrollerRef.current.offsetLeft);
    setScrollLeft(photoScrollerRef.current.scrollLeft);
  };

  // 터치 이동 핸들러
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !photoScrollerRef.current) return;

    e.preventDefault();
    const x = e.touches[0].pageX - photoScrollerRef.current.offsetLeft;
    const walk = (x - touchStartX) * 1.5; // 스크롤 속도 조절 (1.5)
    photoScrollerRef.current.scrollLeft = scrollLeft - walk;
  };

  // 드래그/터치 종료 핸들러
  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';

    // 드래그 후 가장 가까운 사진으로 스냅
    if (photoScrollerRef.current) {
      updateActivePhotoIndex();
      setTimeout(() => {
        scrollToPhoto(activePhotoIndex);
      }, 50); // 약간의 지연 추가로 인덱스 업데이트 확실히 적용
    }
  };

  // 스크롤 이벤트 감지
  useEffect(() => {
    const scrollerElement = photoScrollerRef.current;
    if (!scrollerElement) return;

    const handleScroll = () => {
      updateActivePhotoIndex();
    };

    scrollerElement.addEventListener('scroll', handleScroll);

    return () => {
      scrollerElement.removeEventListener('scroll', handleScroll);
    };
  }, [activePhotoIndex, photoCount]);

  // 드래그 이벤트를 위한 window 이벤트 리스너
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    // 마우스가 창 밖으로 나가도 드래그 이벤트 종료
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, activePhotoIndex]);

  return {
    photoScrollerRef,
    activePhotoIndex,
    isDragging,
    scrollToPhoto,
    handleMouseDown,
    handleMouseMove,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd: handleDragEnd,
  };
};
