'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from '@/store';
import {
  setPrevAdress,
  setHasVisitedPayment,
  resetState,
} from '@/store/slices/revertSeatSlice'; // 액션 불러오기
import { StepIndicator } from '@/components/ticketing/StepIndicator/StepIndicator';
import styles from './page.module.scss';

export default function TicketingPage() {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux 상태 가져오기
  const prevAdress = useSelector((state) => state.revertSeat.prevAdress);
  const hasVisitedPayment = useSelector(
    (state) => state.revertSeat.hasVisitedPayment
  );

  // 초기 마운트 시 상태 초기화
  useEffect(() => {
    console.log('📝 Payment 페이지 마운트 - 상태 초기화 전:', {
      prevAdress,
      hasVisitedPayment,
      timestamp: new Date().toISOString(),
    });

    dispatch(resetState());

    console.log('🔄 상태 초기화 완료', {
      timestamp: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    console.log('💫 Payment useEffect 실행:', {
      isSubscribed,
      prevAdress,
      hasVisitedPayment,
      timestamp: new Date().toISOString(),
    });

    const initializeState = async () => {
      if (!hasVisitedPayment && isSubscribed) {
        console.log('🔄 상태 업데이트 시작 전:', {
          prevAdress,
          hasVisitedPayment,
          timestamp: new Date().toISOString(),
        });

        dispatch(setPrevAdress('payment'));
        dispatch(setHasVisitedPayment(true));

        console.log('✅ 상태 업데이트 완료:', {
          newPrevAddress: 'payment',
          newHasVisitedPayment: true,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.log('⏩ 이미 payment 상태임:', {
          prevAdress,
          hasVisitedPayment,
          timestamp: new Date().toISOString(),
        });
      }
    };

    initializeState();

    return () => {
      isSubscribed = false;

      console.log('🔚 Payment cleanup 시작:', {
        prevAdress,
        hasVisitedPayment,
        timestamp: new Date().toISOString(),
      });
    };
  }, [hasVisitedPayment, prevAdress, dispatch]);

  const handleNextClick = () => {
    console.log('🖱️ 다음 버튼 클릭 전 상태:', {
      prevAdress,
      hasVisitedPayment,
      timestamp: new Date().toISOString(),
    });

    // document.cookie = 'ticketing-progress=4; path=/';

    dispatch(setPrevAdress('payment-left'));

    setTimeout(() => {
      console.log('이동 직전 최종 상태:', {
        prevAdress,
        hasVisitedPayment,
        timestamp: new Date().toISOString(),
      });
      router.push('/ticketing/real/checkout/payment/2');
    }, 100);
  };

  console.log('🎨 Payment 렌더링 시점 상태:', {
    prevAdress,
    hasVisitedPayment,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className={styles.pageContainer}>
      {/* 기존 JSX 내용 유지 */}
      <div className={styles.contentContainer}>
        <StepIndicator currentStep={2} />

        {/* TicketInfo 컴포넌트 통합 */}
        <div className={styles.ticketInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>날짜</span>
            <div className={styles.valueGroup}>
              <span>2025년 5월 22일(목) 18시00분</span>
              <button className={styles.changeButton}>날짜변경</button>
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>좌석</span>
            <span>전체 H 열 120 번</span>
          </div>
        </div>

        {/* DiscountSection 컴포넌트 통합 */}
        <div className={styles.discountSection}>
          <div className={styles.discountRow}>
            <span className={styles.label}>쿠폰</span>
            <div className={styles.valueGroup}>
              <span className={styles.availableText}>사용가능 쿠폰 0장</span>
              <button className={styles.arrowButton}>{'>'}</button>
            </div>
          </div>
          <div className={styles.discountRow}>
            <span className={styles.label}>공연예매권</span>
            <div className={styles.valueGroup}>
              <span className={styles.availableText}>사용가능 0장</span>
              <button className={styles.arrowButton}>{'>'}</button>
            </div>
          </div>
        </div>

        {/* TicketPrice 컴포넌트 통합 */}
        <div className={styles.ticketPrice}>
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>기본가</span>
            <div className={styles.priceControls}>
              <span className={styles.priceValue}>77,000원</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={styles.quantitySelect}
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num}매
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* PriceDetail 컴포넌트 통합 */}
        <div className={styles.priceDetail}>
          <h3 className={styles.priceDetailTitle}>구매금액</h3>
          <div className={styles.priceDetailList}>
            <div className={styles.priceDetailItem}>
              <span>티켓금액</span>
              <span>{(77000 * quantity).toLocaleString()}원</span>
            </div>
            <div className={styles.priceDetailItem}>
              <span>예매수수료</span>
              <span>{(2000 * quantity).toLocaleString()}원</span>
            </div>
            <div className={styles.priceDetailTotal}>
              <span>총 결제금액</span>
              <span className={styles.totalPrice}>
                {((77000 + 2000) * quantity).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.fixedBottom}>
        <button onClick={handleNextClick} className={styles.paymentButton}>
          다음
        </button>
      </div>
    </div>
  );
}
