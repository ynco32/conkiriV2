'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TicketingSeatList from '@/components/ticketing/TicketingSeatList/TicketingSeatList';
import TicketingBottomButton from '@/components/ticketing/TicketingBottomButton/TicketingBottomButton';
import ErrorPopup from '@/components/ticketing/ErrorPopup/ErrorPopup';
import Captcha from '@/components/ticketing/Captcha/Captcha';
import {
  tryReserveSeat,
  fetchSeatsByArea,
  selectTicketingState,
  clearError,
} from '@/store/slices/ticketingSeatSlice';
import { setCaptchaState } from '@/store/slices/captchaSlice';
import { useAppDispatch, useAppSelector } from '@/store/reduxHooks';
import { RootState } from '@/store/types';
import { apiRequest } from '@/api/api'; // 프로젝트에 있는 API 파일 사용
import {
  setHasVisitedPayment,
  setPrevAdress,
  selectRevertSeatState,
} from '@/store/slices/revertSeatSlice'; // revertSeatSlice에서 액션과 선택자 임포트

import styles from './page.module.scss';

export default function SeatPage() {
  const [isActive, setIsActive] = useState(false);
  const [isSecurityMessageOpen, setIsSecurityMessageOpen] = useState(false);
  const [cleanupPerformed, setCleanupPerformed] = useState(false); // cleanup 수행 여부 추적
  const router = useRouter();

  // params 디버깅
  const params = useParams();
  const handleCloseErrorPopup = () => {
    // ticketingSlice의 clearError 액션 사용
    dispatch(clearError());
  };
  // URL 파라미터에서 areaId 가져오기 (params.areaId로 접근)
  const areaId = (params?.areaId as string) || '';

  const dispatch = useAppDispatch();

  // 선택자 함수 사용 - 기존 코드처럼 다시 돌아가기
  const ticketingState = useAppSelector((state) =>
    selectTicketingState(state as any)
  );
  const selectedSeatNumber = ticketingState?.selectedSeatNumber;
  const error = ticketingState?.error;

  const userId = useAppSelector((state: RootState) => state.user?.data?.userId);

  const onSuccess = useAppSelector(
    (state: RootState) => state.captcha?.onSuccess
  );

  // revertSeat 상태 가져오기
  const { hasVisitedPayment, prevAdress } = useAppSelector(
    (state) =>
      selectRevertSeatState(state as any) || {
        hasVisitedPayment: false,
        prevAdress: '',
      }
  );

  console.log('🏁 Seat 컴포넌트 초기 렌더링:', {
    prevAdress,
    hasVisitedPayment,
    timestamp: new Date().toISOString(),
  });

  // cleanup 함수 정의 (apiRequest 사용)
  const cleanup = async () => {
    try {
      console.log('🧹 Cleanup API 호출 전 상태:', {
        prevAdress,
        hasVisitedPayment,
        timestamp: new Date().toISOString(),
      });

      // API 요청 보내기
      await apiRequest('DELETE', '/api/v1/ticketing/sections/seats');
      console.log('✅ Cleanup API 호출 성공');

      // 상태 초기화 (Redux 액션 디스패치)
      dispatch(setPrevAdress(''));
      dispatch(setHasVisitedPayment(false));
      console.log('🔄 상태 초기화 완료');

      // cleanup 수행 표시
      setCleanupPerformed(true);
    } catch (error) {
      console.error('❌ Cleanup API 호출 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 cleanup 체크 및 실행
  useEffect(() => {
    let isMounted = true;

    const handleMount = async () => {
      console.log('🎯 마운트 시 상태 체크:', {
        prevAdress,
        hasVisitedPayment,
        cleanupPerformed,
        timestamp: new Date().toISOString(),
      });

      // 'payment'나 'payment-left' 상태에서만 cleanup 실행 및 아직 cleanup을 수행하지 않은 경우
      if (
        hasVisitedPayment &&
        (prevAdress === 'payment' || prevAdress === 'payment-left') &&
        !cleanupPerformed
      ) {
        console.log('✨ Cleanup 조건 충족, 실행 시작');
        await cleanup();
      } else {
        console.log('❌ Cleanup 조건 불충족:', {
          hasVisitedPayment,
          prevAdress,
          cleanupPerformed,
          timestamp: new Date().toISOString(),
        });
      }
    };

    handleMount();

    return () => {
      isMounted = false;
      console.log('🔚 Seat 페이지 언마운트:', {
        prevAdress,
        hasVisitedPayment,
        cleanupPerformed,
        timestamp: new Date().toISOString(),
      });
    };
  }, []); // 최초 마운트시에만 실행하도록 빈 배열 유지

  // 컴포넌트 마운트 시 해당 구역의 좌석 정보 로드
  useEffect(() => {
    if (areaId) {
      dispatch(fetchSeatsByArea(areaId));
    } else {
      console.error('areaId가 없어 좌석 정보를 로드할 수 없습니다');
    }
  }, [areaId, dispatch]);

  useEffect(() => {
    setIsActive(!!selectedSeatNumber);
  }, [selectedSeatNumber]);

  const handleReservationClick = async () => {
    if (!selectedSeatNumber || !userId) {
      return;
    }

    if (!onSuccess) {
      setIsSecurityMessageOpen(true);
      return;
    }

    try {
      const resultAction = await dispatch(
        tryReserveSeat({ section: areaId, seat: selectedSeatNumber }) as any
      );

      // 성공 시에만 페이지 이동
      if (tryReserveSeat.fulfilled.match(resultAction)) {
        router.push('/ticketing/real/checkout/payment/1');
      }
    } catch (_error) {
      // 에러는 store에서 처리됨
    }
  };

  // areaId가 없는 경우 처리
  if (!areaId) {
    return (
      <div className={styles.container}>
        <div className='error-message'>
          <p>구역 정보가 없습니다. 올바른 URL로 접근해 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <TicketingSeatList areaId={areaId} />

      <TicketingBottomButton
        onClick={handleReservationClick}
        isActive={isActive}
      >
        {selectedSeatNumber
          ? `${areaId}구역 ${selectedSeatNumber}번 좌석 예매하기`
          : '선택된 좌석 없음'}
      </TicketingBottomButton>

      {error && (
        <ErrorPopup isOpen={!!error} onClose={handleCloseErrorPopup}>
          {error.message}
        </ErrorPopup>
      )}
      <Captcha
        isOpen={isSecurityMessageOpen}
        onPostpone={() => setIsSecurityMessageOpen(false)}
        onSuccess={() => {
          setIsSecurityMessageOpen(false);
          dispatch(setCaptchaState(true));
        }}
      />
    </div>
  );
}
