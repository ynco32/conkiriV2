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
import {
  WaitingTimeData,
  WaitingTimeApiResponse,
  NotificationApiResponse,
} from '@/types/websocket';

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
      const waitingTimeSub = client.subscribe(
        waitingTimeTopic,
        (message: IMessage) => {
          console.log(`🤝 waiting-time 구독 메시지 수신`);
          console.log('🤝 waiting-time 수신된 메세지:', message.body);
          console.log(
            '🤝 waiting-time 메시지 헤더:',
            JSON.stringify(message.headers)
          );

          try {
            // 중첩된 데이터 구조에 맞게 파싱 수정
            const response: WaitingTimeApiResponse = JSON.parse(message.body);
            console.log('🤝 waiting-time 전체 응답:', JSON.stringify(response));

            // 중첩된 data 객체에서 필요한 정보 추출
            if (response && response.data) {
              const waitingData = response.data;
              console.log(
                '🤝 waiting-time 파싱된 데이터:',
                JSON.stringify(waitingData)
              );

              dispatch(
                setQueueInfo({
                  queueNumber: waitingData.position,
                  waitingTime: waitingData.estimatedWaitingSeconds,
                  peopleBehind: waitingData.usersAfter,
                })
              );
            } else {
              console.error(
                '🤝 waiting-time 응답에 data 필드가 없음:',
                response
              );
            }
          } catch (error) {
            console.error('🤝 waiting-time 메시지 파싱 오류:', error);
            console.error('🤝 원본 메시지:', message.body);
          }
        }
      );
      console.log('🤝 waiting-time 구독 ID:', waitingTimeSub.id);

      console.log(`🤝 구독 시작: ${notificationTopic}`);
      const notificationSub = client.subscribe(
        notificationTopic,
        (message: IMessage) => {
          console.log(`🤝 notification 구독 메시지 수신`);
          console.log('🤝 notification 수신된 메세지:', message.body);
          console.log(
            '🤝 notification 메시지 헤더:',
            JSON.stringify(message.headers)
          );

          try {
            // 수정된 API 응답 형식에 맞게 파싱
            const response: NotificationApiResponse = JSON.parse(message.body);
            console.log('🤝 notification 전체 응답:', JSON.stringify(response));

            if (response && response.data === true) {
              console.log('🤝 입장 가능 상태, 페이지 이동 시작');
              router.push('/ticketing/real/areas/areaSelect');
            } else {
              console.log('🤝 아직 입장 불가능 상태');
            }
          } catch (error) {
            console.error('🤝 notification 메시지 파싱 오류:', error);
            console.error('🤝 오류 상세:', JSON.stringify(error));
            console.error('🤝 원본 메시지:', message.body);
          }
        }
      );
      console.log('🤝 notification 구독 ID:', notificationSub.id);

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
        console.error('🤝 STOMP 에러:', frame.headers, frame.body);
        isConnecting = false;
      };

      client.onWebSocketError = (event) => {
        console.error('🤝 웹소켓 에러 발생:', event);
        console.error('🤝 웹소켓 에러 타입:', event.type);
        if (event instanceof ErrorEvent) {
          console.error('🤝 웹소켓 에러 메시지:', event.message);
        }
        isConnecting = false;
      };

      client.onWebSocketClose = (event) => {
        console.log(
          '🤝 웹소켓 연결 닫힘. 코드:',
          event.code,
          '이유:',
          event.reason || '이유 없음'
        );
        console.log('🤝 연결 종료 시 상태:', {
          세션ID: globalSessionId,
          구독상태: hasSubscribed,
        });

        hasSubscribed = false;
        setIsSubscribed(false);
        isConnecting = false;
      };

      client.onConnect = (frame) => {
        console.log('🤝 웹소켓 연결 성공');
        console.log('🤝 연결 프레임 헤더:', JSON.stringify(frame.headers));
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

  // 웹소켓 연결 해제 함수 추가
  const disconnectWebSocket = () => {
    console.log('🤝 웹소켓 연결 해제 시작');

    if (globalStompClient && globalStompClient.connected) {
      try {
        // 웹소켓 연결 종료
        globalStompClient.deactivate();
        console.log('🤝 웹소켓 연결 해제 완료');
      } catch (error) {
        console.error('🤝 웹소켓 연결 해제 중 오류:', error);
      }
    } else {
      console.log('🤝 웹소켓이 이미 연결 해제되었거나 초기화되지 않았습니다.');
    }

    // 전역 상태 초기화
    globalStompClient = null;
    isConnecting = false;
    isSubscribing = false;
    hasSubscribed = false;
    globalSessionId = null;

    // 로컬 상태 업데이트
    setSessionId(null);
    setIsSubscribed(false);

    // 대기열 정보 초기화
    dispatch(
      setQueueInfo({
        queueNumber: 0,
        waitingTime: 0,
        peopleBehind: 0,
      })
    );
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

    // 주기적으로 연결 상태 로깅
    const connectionCheckInterval = setInterval(() => {
      if (globalStompClient) {
        console.log('🤝 웹소켓 상태 점검:', {
          연결됨: globalStompClient.connected,
          구독됨: hasSubscribed,
          세션ID: globalSessionId,
        });
      }
    }, 30000); // 30초마다 확인

    // 컴포넌트 언마운트 시 전역 상태는 유지
    return () => {
      console.log('🤝 useWebSocketQueue 훅 클린업');
      clearInterval(connectionCheckInterval);
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
      console.log('🤝 대기열 진입 API 응답:', JSON.stringify(response.data));
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
        console.error(
          '🤝 API 에러 상세:',
          JSON.stringify({
            상태: error.response?.status,
            데이터: error.response?.data,
            메시지: error.message,
          })
        );

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
    disconnectWebSocket, // 새로 추가된 함수 반환
  };
};
