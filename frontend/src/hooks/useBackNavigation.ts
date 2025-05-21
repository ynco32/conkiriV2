import { useState, useRef, useEffect, useCallback } from 'react';

interface UseBackNavigationProps {
  onConfirm: () => void;
  backPath?: string;
}

/**
 * 브라우저 뒤로가기 버튼 클릭 시 확인 모달을 표시하는 훅
 *
 * @param onConfirm 뒤로가기 확인 시 실행할 함수
 * @param backPath 이동할 경로 (옵션)
 */
export const useBackNavigation = ({
  onConfirm,
  backPath,
}: UseBackNavigationProps) => {
  // 페이지 이탈 확인 모달 상태
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // 페이지 해시 키 참조
  const locationKeyRef = useRef<string>('');

  // 페이지 이탈 시도 처리
  const handleExit = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  // 페이지 이탈 확인
  const confirmExit = useCallback(() => {
    setShowExitConfirm(false);
    onConfirm();
  }, [onConfirm]);

  // 페이지 이탈 취소
  const cancelExit = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  // 해시 설정 함수를 분리하여 외부에서도 호출할 수 있게 함
  const setupHashKey = useCallback(() => {
    // 이미 해시가 있으면 설정하지 않음
    if (!locationKeyRef.current) {
      const randomKey = Math.random().toString(36).substring(2, 8);
      locationKeyRef.current = randomKey;
      window.location.hash = randomKey;
    }
  }, []);

  // 브라우저의 뒤로가기 버튼 처리 - hash 변경 감지 방식
  useEffect(() => {
    // 약간의 지연 후에 해시키 설정
    const timer = setTimeout(() => {
      setupHashKey();
    }, 100);

    const handleHashChange = () => {
      // 해시가 변경되었고(비어있고) 이전에 해시가 있었다면 뒤로가기로 간주
      if (window.location.hash === '' && locationKeyRef.current) {
        // 해시를 다시 설정하여 페이지 이동을 방지
        window.location.hash = locationKeyRef.current;
        // 확인창 표시
        setShowExitConfirm(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [setupHashKey]);

  return {
    showExitConfirm,
    handleExit,
    confirmExit,
    cancelExit,
    setupHashKey, // 해시 설정 함수 외부 노출
  };
};
