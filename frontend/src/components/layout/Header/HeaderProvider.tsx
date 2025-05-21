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
import { RootState, AppDispatch } from '@/store';
import {
  clearCurrentArena,
  resetToDefaultMapView,
} from '@/store/slices/arenaSlice';
import { useSelector, useDispatch } from 'react-redux';

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
  setSeatDetail: (detail: string | null) => void; // 좌석 정보 설정 함수
  handleArenaInfoClick: () => void; // 공연장 정보 클릭 핸들러 추가
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
  setSeatDetail: () => {},
  handleArenaInfoClick: () => {},
});

// 컨텍스트 사용을 위한 훅
export const useHeader = () => useContext(HeaderContext);

interface HeaderProviderProps {
  children: ReactNode;
}

export const HeaderProvider = ({ children }: HeaderProviderProps) => {
  const pagesWithoutHeader = [
    '/',
    '/login',
    '/onboarding',
    '/login/nick',
    '/login/artist',
    '/login/concert',
  ];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldShowDetail, setShouldShowDetail] = useState(false);
  const [seatDetail, setSeatDetail] = useState<string | null>(null);
  // 티켓팅 진행 중 마지막으로 선택한 구역 저장
  const [lastSelectedArea, setLastSelectedArea] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux에서 경기장 정보 가져오기
  const arenaInfo = useSelector((state: RootState) => state.arena.currentArena);

  const hasHeader = !pagesWithoutHeader.includes(pathname);

  // 경기장 정보 클릭 핸들러 - 현장 페이지만
  const handleArenaInfoClick = () => {
    // 시야 페이지에서는 동작하지 않도록
    if (!pathname.startsWith('/place')) return;

    // 지도 중심을 공연장 기본 위치로 리셋
    dispatch(resetToDefaultMapView());
  };

  // 경로 변경 추적 및 마지막 선택 구역 업데이트
  useEffect(() => {
    // 이전 경로를 저장
    const prevPath = sessionStorage.getItem('currentPath') || '';
    // 현재 경로 업데이트
    sessionStorage.setItem('previousPath', prevPath);
    sessionStorage.setItem('currentPath', pathname);

    // 구역 페이지 방문 시 마지막 선택 구역 저장
    if (pathname.match(/^\/ticketing\/real\/areas\/[^\/]+$/)) {
      // /ticketing/real/areas/A 에서 A 추출
      const areaId = pathname.split('/').pop();
      if (areaId) {
        sessionStorage.setItem('lastSelectedArea', areaId);
        setLastSelectedArea(areaId);
      }
    }

    updateDetailState(pathname);
  }, [pathname]);

  const rootPaths = ['/main'];
  const shouldShowLogo = rootPaths.some((path) => path === pathname);

  // 경로에 따른 상세 정보 표시 여부 결정
  const updateDetailState = (path: string) => {
    if (path === '/place' || path === '/sight') {
      setShouldShowDetail(false);
      // 목록 페이지로 돌아갈 때 경기장 정보 유지 (새로고침 대비)
    }
    // /sight/[arenaId] - 구역 선택 페이지
    else if (path.match(/^\/sight\/[^\/]+$/)) {
      setShouldShowDetail(true);
      setSeatDetail('시야 보기');
    } else if (path.match(/^\/sight\/reviews\/[^\/]+$/)) {
      setShouldShowDetail(false);
    }
    // /sight/[arenaId]/[sectionId] - 좌석 선택 페이지
    else if (path.match(/^\/sight\/[^\/]+\/[^\/]+$/)) {
      setShouldShowDetail(true);
      // 경로에서 구역 정보 추출
      const sectionId = path.split('/')[3];
      const cleanSectionId = sectionId ? sectionId.substring(1) : '';
      setSeatDetail(cleanSectionId ? `${cleanSectionId} 구역` : '좌석 선택');
    }
    // /place/[arenaId] - 현장 페이지
    else if (path.match(/^\/place\/[^\/]+$/)) {
      setShouldShowDetail(true);
      setSeatDetail('현장');
    }
    // /ticketing/real/areas/[areaId] - 구역 선택 페이지
    else if (path.match(/^\/ticketing\/real\/areas\/[^\/]+$/)) {
      setShouldShowDetail(true);
      // 경로에서 구역 정보 추출
      const areaId = path.split('/').pop();
      setSeatDetail(areaId ? `${areaId} 구역` : '구역 선택');
    }
    // /ticketing/real/checkout/payment/1 - 결제 첫 단계
    else if (path.match(/^\/ticketing\/real\/checkout\/payment\/1$/)) {
      setShouldShowDetail(true);
      setSeatDetail('결제 정보');
    }
    // /ticketing/real/checkout/payment/2 - 결제 두번째 단계
    else if (path.match(/^\/ticketing\/real\/checkout\/payment\/2$/)) {
      setShouldShowDetail(true);
      setSeatDetail('결제 확인');
    } else {
      setShouldShowDetail(false);

      // 완전히 다른 섹션으로 이동할 때만 초기화
      const prevPath = sessionStorage.getItem('currentPath') || '';
      if (!prevPath.startsWith('/place') && !prevPath.startsWith('/sight')) {
        dispatch(clearCurrentArena());
      }
    }
  };

  // 경로에 따른 타이틀 매핑
  const getTitleByPath = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathname.startsWith('/mypage/sight')) return '나의 후기';
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

    if (pathSegments[0] === 'sight' && pathSegments[2] === 'write') {
      return '리뷰 쓰기';
    }
    if (pathSegments[0] === 'sight' && pathSegments[2] === 'edit') {
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

    // 결제 첫 단계 페이지에서의 뒤로가기 - 마지막으로 선택한 구역으로 이동
    if (pathname === '/ticketing/real/checkout/payment/1') {
      // sessionStorage에서 마지막 선택 구역 가져오기
      const areaId = sessionStorage.getItem('lastSelectedArea');
      if (areaId) {
        // 마지막으로 선택한 구역으로 이동
        router.push(`/ticketing/real/areas/${areaId}`);
      } else {
        // 구역 정보가 없으면 기본 구역 선택 페이지로 이동
        router.push('/ticketing/real/areas');
      }
      return;
    }

    // 결제 두번째 단계에서는 첫 단계로 이동
    if (pathname === '/ticketing/real/checkout/payment/2') {
      router.push('/ticketing/real/checkout/payment/1');
      return;
    }

    // 일반적인 뒤로가기 동작 처리
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
    setSeatDetail,
    handleArenaInfoClick,
  };

  return (
    <HeaderContext.Provider value={headerContextValue}>
      {hasHeader && <Header />}
      {children}
    </HeaderContext.Provider>
  );
};
