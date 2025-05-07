// src/components/HeaderProvider.tsx
'use client';
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { determineBackNavigation } from '@/lib/utils/navigation';
import { ArenaInfo } from '@/types/arena';
import Header from './Header';

// 헤더 컨텍스트 타입 정의
interface HeaderContextType {
  title: string;
  shouldShowDetail: boolean;
  shouldShowLogo: boolean;
  arenaInfo: ArenaInfo | null; // 경기장(공연장) 정보
  seatDetail: string | null; // 좌석 상세 정보
  handleBack: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  setArenaInfo: (info: ArenaInfo | null) => void; // 경기장 정보 설정 함수
  setSeatDetail: (detail: string | null) => void; // 좌석 정보 설정 함수
}

// 기본값으로 컨텍스트 생성
export const HeaderContext = createContext<HeaderContextType>({
  title: '',
  shouldShowDetail: false,
  shouldShowLogo: false,
  arenaInfo: null,
  seatDetail: null,
  handleBack: () => {},
  isMenuOpen: false,
  setIsMenuOpen: () => {},
  setArenaInfo: () => {},
  setSeatDetail: () => {},
});

// 컨텍스트 사용을 위한 훅
export const useHeader = () => useContext(HeaderContext);

interface HeaderProviderProps {
  children: ReactNode;
}

export const HeaderProvider = ({ children }: HeaderProviderProps) => {
  const pagesWithoutHeader = ['/', '/login'];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldShowDetail, setShouldShowDetail] = useState(false);
  const [arenaInfo, setArenaInfo] = useState<ArenaInfo | null>(null);
  const [seatDetail, setSeatDetail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const hasHeader = !pagesWithoutHeader.includes(pathname);
  // 경로 변경 추적
  useEffect(() => {
    // 이전 경로를 저장
    const prevPath = sessionStorage.getItem('currentPath') || '';
    // 현재 경로 업데이트
    sessionStorage.setItem('previousPath', prevPath);
    sessionStorage.setItem('currentPath', pathname);
    updateDetailState(pathname);
  }, [pathname]);

  const rootPaths = ['/main'];
  const shouldShowLogo = rootPaths.some((path) => path === pathname);

  // 경로에 따른 상세 정보 표시 여부 결정
  const updateDetailState = (path: string) => {
    // 경로에 따라 shouldShowDetail 설정
    // 예: /sight/[venueid] 형태의 경로에서 상세 정보 표시
    if (path.match(/^\/sight\/[^\/]+$/)) {
      setShouldShowDetail(true);
      // 여기서는 예시로 설정하지만 실제로는 API 호출 등으로 데이터를 가져올 수 있음
      // fetchVenueInfo(venueId);
      setSeatDetail('12구역 34열 56번');
    } else if (path.match(/^\/place\/[^\/]+$/)) {
      setShouldShowDetail(true);
      setSeatDetail('현장'); // 현장 페이지
    } else {
      setShouldShowDetail(false);
      setArenaInfo(null);
    }
  };

  // 경로에 따른 타이틀 매핑
  const getTitleByPath = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathname.startsWith('/sight/reviews/write')) return '리뷰 쓰기';
    if (pathname.startsWith('/mypage/sight')) return '나의 후기';
    if (pathname.startsWith('/mypage/sharing')) return '나의 나눔글';
    if (pathname.startsWith('/mypage/ticketing')) return '티켓팅 기록';

    if (pathSegments[0] === 'minigame' && pathSegments[1] === 'entrance') {
      return '대기열 입장 연습';
    }
    if (pathSegments[0] === 'minigame' && pathSegments[1] === 'grape') {
      return '좌석 선택 연습';
    }
    if (
      pathSegments[0] === 'minigame' &&
      pathSegments[1] === 'securityMessage'
    ) {
      return '보안 문자 연습';
    }
    if (pathname.startsWith('/minigame')) return '티켓팅 미니 게임';

    if (pathSegments[0] === 'sharing' && pathSegments[2] === 'write') {
      return '나눔 등록';
    }
    if (pathSegments[0] === 'sharing' && pathSegments[3] === 'edit') {
      return '나눔글 수정';
    }
    if (pathSegments[0] === 'sight' && pathSegments[3] === 'edit') {
      return '리뷰 수정';
    }

    if (pathname.startsWith('/sight')) return '시야 보기';
    if (pathname.startsWith('/place')) return '현장 정보';
    if (pathname.startsWith('/mypage')) return '마이페이지';
    if (pathname.startsWith('/ticketing')) return '티켓팅 연습';
    return '';
  };

  // 뒤로 가기 동작 처리
  const handleBack = () => {
    const previousPath = sessionStorage.getItem('previousPath') || '';
    const navAction = determineBackNavigation(pathname, previousPath);

    switch (navAction.type) {
      case 'push':
        router.push(navAction.path!, navAction.options);
        break;
      case 'replace':
        router.replace(navAction.path!, navAction.options);
        break;
      case 'history-back':
      default:
        window.history.back();
        break;
    }
  };

  const title = getTitleByPath();

  // 컨텍스트 값 정의
  const headerContextValue: HeaderContextType = {
    title,
    shouldShowDetail,
    shouldShowLogo,
    arenaInfo,
    seatDetail,
    handleBack,
    isMenuOpen,
    setIsMenuOpen,
    setArenaInfo,
    setSeatDetail,
  };

  return (
    <HeaderContext.Provider value={headerContextValue}>
      {hasHeader && <Header />}
      {children}
    </HeaderContext.Provider>
  );
};
