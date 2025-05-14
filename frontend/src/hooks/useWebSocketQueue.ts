'use client';
import { useRef, useEffect, useState } from 'react';
import { Client, IMessage, StompHeaders } from '@stomp/stompjs';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setQueueInfo } from '@/store/slices/queueSlice';
import { setError } from '@/store/slices/errorSlice';
import { apiClient } from '@/api/api';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/types/api';
import { WaitingTimeResponse } from '@/types/websocket';

// NotificationResponse 인터페이스 수정 (ApiResponse와 유사한 형태)
interface NotificationResponse {
  data: boolean;
  error: { code: string; message: string } | null;
  meta: { timestamp: string };
}

// 전역 변수로 상태 관리 (컴포넌트 리렌더링에 영향받지 않음)
let globalStompClient: Client | null = null;
let isConnecting = false;
let isSubscribing = false;
let isEnteringQueue = false;
let hasSubscribed = false;
let globalSessionId: string | null = null;

export const useWebSocketQueue = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [sessionId, setSessionId] = useState<string | null>(globalSessionId);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(hasSubscribed);
  const hasInitializedRef = useRef(false);

  // 세션 ID로 토픽 구독 함수
  const subscribeToTopics = (client: Client, sid: string) => {
    if (hasSubscribed || isSubscribing) {
      console.log('🤝 이미 구독 중이거나 구독 처리 중입니다.');
      return;
    }

    console.log(`🤝 subscribeToTopics 함수 호출됨: ${sid}`);
    isSubscribing = true;

    try {
      const waitingTimeTopic = `/user/${sid}/book/waiting-time`;
      const notificationTopic = `/user/${sid}/book/notification`;

      console.log(`🤝 구독 시작: ${waitingTimeTopic}`);
      client.subscribe(waitingTimeTopic, (message: IMessage) => {
        console.log(`🤝 waiting-time 구독 메시지 수신`);
        console.log('🤝 waiting-time 수신된 메세지:', message.body);
        try {
          const response: WaitingTimeResponse = JSON.parse(message.body);
          dispatch(
            setQueueInfo({
              queueNumber: response.position,
              waitingTime: response.estimatedWaitingSeconds,
              peopleBehind: response.usersAfter,
            })
          );
        } catch (error) {
          console.error('🤝 waiting-time 메시지 파싱 오류:', error);
        }
      });

      console.log(`🤝 구독 시작: ${notificationTopic}`);
      client.subscribe(notificationTopic, (message: IMessage) => {
        console.log(`🤝 notification 구독 메시지 수신`);
        console.log('🤝 notification 수신된 메세지:', message.body);

        try {
          console.log('🤝 원시 메시지:', message.body);
          const response: NotificationResponse = JSON.parse(message.body);
          console.log('🤝 파싱된 알림 응답:', response);

          if (response.data === true) {
            console.log('🤝 입장 가능 상태, 페이지 이동 시작');
            router.push('./real/areaSelect');
          } else {
            console.log('🤝 아직 입장 불가능 상태');
          }
        } catch (error) {
          console.error('🤝 notification 메시지 파싱 오류:', error);
          console.error('🤝 오류 상세:', JSON.stringify(error));
          try {
            console.log('🤝 원본 메시지(문자열):', message.body);
          } catch (e) {
            console.error('🤝 원본 메시지 접근 오류:', e);
          }
        }
      });

      hasSubscribed = true;
      setIsSubscribed(true);
      console.log('🤝 모든 토픽 구독 완료, 상태:', true);
    } catch (error) {
      console.error('🤝 구독 중 오류 발생:', error);
      hasSubscribed = false;
      setIsSubscribed(false);
    } finally {
      isSubscribing = false;
    }
  };

  // 웹소켓 설정 함수
  const setupWebSocket = () => {
    if (isConnecting || (globalStompClient && globalStompClient.connected)) {
      console.log('🤝 웹소켓이 이미 연결 중이거나 연결되어 있습니다.');
      return;
    }

    if (process.env.NEXT_PUBLIC_DISABLE_WEBSOCKET === 'true') {
      return;
    }

    console.log('🤝 웹소켓 연결 시작...');
    isConnecting = true;

    if (!window.WebSocket) {
      console.error('🤝 이 브라우저는 WebSocket을 지원하지 않습니다.');
      isConnecting = false;
      return;
    }

    try {
      const client = new Client({
        brokerURL: 'wss://conkiri.shop/ticketing-platform',
        debug: (str: string) => console.log('🤝 STOMP: ' + str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onStompError = (frame: {
        headers: StompHeaders;
        body: string;
      }) => {
        console.error('🤝 STOMP 에러:', frame);
        isConnecting = false;
      };

      client.onWebSocketError = (event) => {
        console.error('🤝 웹소켓 에러 발생:', event);
        isConnecting = false;
      };

      client.onWebSocketClose = (event) => {
        console.log(
          '🤝 웹소켓 연결 닫힘. 코드:',
          event.code,
          '이유:',
          event.reason || '이유 없음'
        );

        hasSubscribed = false;
        setIsSubscribed(false);
        isConnecting = false;
      };

      client.onConnect = () => {
        console.log('🤝 웹소켓 연결 성공');
        isConnecting = false;
        globalStompClient = client;

        if (globalSessionId && !hasSubscribed) {
          console.log('🤝 연결 직후 구독 시도:', globalSessionId);
          subscribeToTopics(client, globalSessionId);
        }
      };

      client.activate();
      globalStompClient = client;
    } catch (error) {
      console.error('🤝 웹소켓 초기화 중 오류:', error);
      isConnecting = false;
    }
  };

  // 한 번만 실행되는 초기화 로직
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    console.log('🤝 useWebSocketQueue 훅 초기화 - 최초 한 번만 실행');

    if (!globalStompClient) {
      setupWebSocket();
    } else if (
      globalStompClient.connected &&
      globalSessionId &&
      !hasSubscribed
    ) {
      subscribeToTopics(globalStompClient, globalSessionId);
    }

    // 컴포넌트 언마운트 시 전역 상태는 유지
    return () => {
      console.log('🤝 useWebSocketQueue 훅 클린업');
      // 연결 유지 (페이지 이동 시에도 연결 상태 보존)
    };
  }, []);

  // 전역 상태 변경 시 로컬 상태 동기화
  useEffect(() => {
    setSessionId(globalSessionId);
    setIsSubscribed(hasSubscribed);
  }, []);

  // 대기열 진입 함수
  const enterQueue = async () => {
    if (isEnteringQueue) {
      console.log('🤝 이미 대기열 진입 처리 중입니다.');
      return;
    }

    if (globalSessionId && hasSubscribed) {
      console.log('🤝 이미 대기열에 진입한 상태입니다:', globalSessionId);
      return;
    }

    console.log('🤝 enterQueue 함수 호출됨');
    isEnteringQueue = true;

    try {
      console.log('🤝 대기열 진입 API 요청 시작');
      const response = await apiClient.post<ApiResponse<string>>(
        `/api/v1/ticketing/queue`
      );
      const receivedSessionId = response.data.data;
      console.log(`🤝 대기열 진입 성공: sessionId = ${receivedSessionId}`);

      globalSessionId = receivedSessionId;
      setSessionId(receivedSessionId);

      if (globalStompClient) {
        if (globalStompClient.connected) {
          console.log('🤝 웹소켓이 이미 연결되어 있습니다. 구독 시도.');
          if (!hasSubscribed) {
            subscribeToTopics(globalStompClient, receivedSessionId);
          }
        } else {
          console.log('🤝 웹소켓 연결이 필요합니다.');
          setupWebSocket();
        }
      } else {
        console.log('🤝 웹소켓 클라이언트 초기화 필요');
        setupWebSocket();
      }
    } catch (error: unknown) {
      console.error('🤝 대기열 진입 API 오류:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          dispatch(setError('이미 티켓팅에 참여하셨습니다.'));
        } else {
          const errorMessage =
            error.response?.data?.error?.message ||
            '티켓팅 참여 중 오류가 발생했습니다.';
          dispatch(setError(errorMessage));
        }
      }
    } finally {
      isEnteringQueue = false;
    }
  };

  return {
    enterQueue,
    sessionId,
    isSubscribed,
  };
};
