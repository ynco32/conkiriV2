'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useTicketingTimer } from '@/hooks/useTicketingTimer';
import ScheduleSelection from '@/components/ticketing/ScheduleSelection/ScheduleSelection';
import { useWebSocketQueue } from '@/hooks/useWebSocketQueue';
import { apiRequest } from '@/api/api';

import styles from './page.module.scss';
interface TicketingTimeInfo {
  startTime: string;
  serverTime: string;
  isWithin10Minutes: boolean;
  isFinished: boolean;
  concertName: string;
  ticketingPlatform: string;
  photoUrl:string;
}

// WebSocket을 사용하는 컴포넌트만 dynamic으로 로드
const DynamicWebSocketProvider = dynamic(
  () => import('@/components/ticketing/WebSocketProvider/WebSocketProvider'),
  { ssr: false }
);
const DynamicQueuePopup = dynamic(
  () => import('@/components/ticketing/QueuePopup/QueuePopup'),
  { ssr: false }
);
const DynamicErrorPopup = dynamic(
  () => import('@/components/ticketing/ErrorPopup/ErrorPopup'),
  { ssr: false }
);

export default function RealModePage() {

  const [isSchedulePopupOpen, setSchedulePopupOpen] = useState(false);
  const [isQueuePopupOpen, setQueuePopupOpen] = useState(false);
  const [isWebSocketConnected, setWebSocketConnected] = useState(false);
  const { buttonDisabled, buttonMessage } = useTicketingTimer();
  const { disconnectWebSocket, enterQueue } = useWebSocketQueue();
  const mountedRef = useRef(false);


  const [ticketingInfo, setTicketingInfo] = useState<TicketingTimeInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [concertError, setConcertError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicketingInfo = async () => {
      try {
        const data = await apiRequest<TicketingTimeInfo>(
          'GET',
          '/api/v1/ticketing/time-info'
        );
        if (data) {
          setTicketingInfo(data);
        }
      } catch (error: any) {
        setConcertError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketingInfo();
  }, []);

  // 날짜 포맷팅 함수
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 요일 배열
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekday = weekdays[date.getDay()];

    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${month.toString().padStart(2, '0')}.${day
      .toString()
      .padStart(2, '0')}(${weekday}) ${hours
      .toString()
      .padStart(2, '0')}:${minutes.toString().padStart(2, '0')} OPEN!`;
  };

  const error = useSelector((state: RootState) => state.error.message);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleScheduleSelect = () => {
    setSchedulePopupOpen(false);

    // 웹소켓 연결 준비
    console.log('스케줄 선택 완료, 웹소켓 연결 준비');
    setWebSocketConnected(true);

    // 일단 팝업은 약간 지연시켜 표시
    setTimeout(() => {
      if (mountedRef.current) {
        setQueuePopupOpen(true);
      }
    }, 300);
  };

  const handleQueuePopupClose = () => {
    // QueuePopup을 닫을 때 웹소켓 연결도 해제
    console.log('큐 팝업 닫기, 웹소켓 연결 해제 중');
    disconnectWebSocket();
    setQueuePopupOpen(false);
    setWebSocketConnected(false);
  };

  return (
    <div>
      <div className={styles.posterSection}>
        <Image
          className={styles.poster}
          src={ticketingInfo?.photoUrl || '/images/dummy.png'}
          alt='poster'
          width={100}
          height={170}
        />
        <div className={styles.posterInfo}>
          <div className={styles.badgeContainer}>
            <span className={styles.exclusiveBadge}>단독판매</span>
            <span className={styles.verifiedBadge}>인증예매</span>
          </div>
          <div className={styles.titleSection}>
            <h3 className={styles.concertTitle}>
              {ticketingInfo ? ticketingInfo.concertName : '20XX ASIA TOUR CONCERT in SEOUL'}
            </h3>
            <p className={styles.concertCategory}>콘서트 | 7세 이상</p>
          </div>
        </div>
      </div>

      {/* 나머지 UI 요소들 */}
      <div>
        <div className={styles.performanceInfo}>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>공연기간</div>
            <div className={styles.infoValue}>20XX.xx.xx - 20XX.xx.xx</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>공연장</div>
            <div className={styles.infoValue}>KSPO DOME</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>관람시간</div>
            <div className={styles.infoValue}>-</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>할인혜택</div>
            <div className={styles.infoValue}>무이자</div>
          </div>
        </div>

        <div className={styles.tabs}>
          <span className={styles.tabActive}>상세정보</span>
          <span className={styles.tabInactive}>공연장정보</span>
          <span className={styles.tabInactive}>예매안내</span>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceHeader}>
            <h3 className={styles.priceTitle}>공연시간</h3>
            <p className={styles.priceNote}>
              20xx년 xx월 xx일(토) ~ xx월 xx일(일)
            </p>
            <p className={styles.priceNote}>토 오후 6시 / 일 오후 5시</p>
          </div>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceHeader}>
            <h3 className={styles.priceTitle}>가격정보</h3>
            <p className={styles.priceNote}>기본가</p>
          </div>
        </div>

        <div className={styles.seatLegend}>
          <div>
            <span className={styles.seatColorVip}></span>
            <span>VIP석</span>
          </div>
          <span>198,000원</span>
          <div>
            <span className={styles.seatColorGeneral}></span>
            <span>일반석</span>
          </div>
          <span>154,000원</span>
        </div>

        <button
          type='button'
          onClick={() => setSchedulePopupOpen(true)}
          disabled={buttonDisabled}
          className={`${styles.fixedButton} ${
            buttonDisabled ? styles.disabled : ''
          }`}
        >
          {buttonMessage}
        </button>
      </div>

      <ScheduleSelection
        isOpen={isSchedulePopupOpen}
        onClose={() => setSchedulePopupOpen(false)}
        onScheduleSelect={handleScheduleSelect}
      />

      {/* 웹소켓 연결 및 큐 팝업 관리 */}
      {isWebSocketConnected && (
        <DynamicWebSocketProvider
          onEnterQueue={true}
          title='ASIA TOUR LOG in SEOUL'
        />
      )}

      {error && <DynamicErrorPopup isOpen={!!error}>{error}</DynamicErrorPopup>}
    </div>
  );
}
