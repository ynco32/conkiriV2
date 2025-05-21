'use client';
import React, { useState, useEffect } from 'react';
import { useWebSocketQueue } from '@/hooks/useWebSocketQueue';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import QueuePopup from '@/components/ticketing/QueuePopup/QueuePopup';

interface WebSocketProviderProps {
  onEnterQueue?: boolean;
  title?: string; // QueuePopup에 표시할 제목
}

export default function WebSocketProvider({
  onEnterQueue = false,
  title = '티켓팅', // 기본 제목
}: WebSocketProviderProps) {
  const { enterQueue, disconnectWebSocket } = useWebSocketQueue();
  const [hasEnteredQueue, setHasEnteredQueue] = useState(false);
  const queueInfo = useSelector((state: RootState) => state.queue);
  const [isLoading, setIsLoading] = useState(false);
  const [isQueuePopupOpen, setQueuePopupOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // WebSocket 연결 및 대기열 진입
    if (onEnterQueue && !hasEnteredQueue) {
      console.log('🤝 WebSocketProvider: enterQueue 호출 시작');
      setIsLoading(true);
      setQueuePopupOpen(true); // 팝업 열기
      setHasEnteredQueue(true);

      // enterQueue 호출
      const enterQueueAsync = async () => {
        try {
          await enterQueue();
          console.log('🤝 WebSocketProvider: enterQueue 완료');
        } catch (error) {
          console.error('🤝 WebSocketProvider: enterQueue 오류', error);
        } finally {
          if (isMounted) {
            // 짧은 지연 후 로딩 종료
            setTimeout(() => {
              if (isMounted) {
                setIsLoading(false);
              }
            }, 800);
          }
        }
      };

      enterQueueAsync();
    }

    return () => {
      isMounted = false;
      console.log('🤝 WebSocketProvider: clean-up 함수 실행');
    };
  }, [onEnterQueue, enterQueue, hasEnteredQueue]);

  // queueInfo 업데이트 시 로딩 상태 확인
  useEffect(() => {
    if (
      queueInfo.queueNumber > 0 ||
      queueInfo.waitingTime > 0 ||
      queueInfo.peopleBehind > 0
    ) {
      setIsLoading(false);
    }
  }, [queueInfo]);

  const handleQueuePopupClose = () => {
    // QueuePopup을 닫을 때 웹소켓 연결도 해제
    console.log('🤝 WebSocketProvider: 큐 팝업 닫기, 웹소켓 연결 해제 중');
    disconnectWebSocket();
    setQueuePopupOpen(false);
  };

  return (
    <>
      {isQueuePopupOpen && (
        <QueuePopup
          title={title}
          onClose={handleQueuePopupClose}
          isOpen={isQueuePopupOpen}
          isLoading={isLoading} // 로딩 상태 전달
        />
      )}
    </>
  );
}
