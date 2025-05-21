// src/components/main/TicketingInfo.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/api/api';
import styles from '@/app/main/page.module.scss';

interface TicketingTimeInfo {
  startTime: string;
  serverTime: string;
  isWithin10Minutes: boolean;
  isFinished: boolean;
  concertName: string;
  ticketingPlatform: string;
}

export default function TicketingInfo() {
  const [ticketingInfo, setTicketingInfo] = useState<TicketingTimeInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(error.message);
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

  return (
    <div
      className={`${styles.menuItem} ${styles.wide} ${styles.menuItemPractice}`}
    >
      <Link href='/ticketing/real' className={styles.link}>
        <div className={styles.ticketingWrapper}>
          <div className={styles.ticketingContent}>
            <span className={styles.label}>실전 티켓팅 연습</span>
            <span className={styles.description}>
              티켓팅 직전, 실전같은 연습!
            </span>
          </div>

          <div className={styles.ticketingTitle}>
            {loading
              ? '티켓팅 정보를 가져오는 중...'
              : error
              ? error
              : ticketingInfo
              ? ticketingInfo.concertName
              : '예정된 티켓팅이 없습니다'}
          </div>
          {!loading && ticketingInfo && (
            <div className={styles.ticketBadge}>
              {formatDateTime(ticketingInfo.startTime)}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
