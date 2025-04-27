'use client';
// hooks/useWebSocketQueue.ts
import { useRef, useEffect } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { useRouter } from 'next/navigation';
import { useQueueStore } from '@/store/useQueueStore';
import { useErrorStore } from '@/store/useErrorStore';
import api from '@/lib/api/axios';
import { AxiosError } from 'axios';

export const useWebSocketQueue = () => {
  const router = useRouter();
  const stompClient = useRef<Client | null>(null);
  const setQueueInfo = useQueueStore((state) => state.setQueueInfo);
  const setError = useErrorStore((state) => state.setError);

  const getAccessToken = () => {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token='))
      ?.split('=')[1];
  };

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DISABLE_WEBSOCKET === 'true') {
      return;
    }
    const client = new Client({
      brokerURL: 'wss://conkiri.com/ticketing-melon',
      connectHeaders: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
      debug: (str) => console.log('🤝 STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onStompError = (frame) => {
      console.error('🤝 STOMP 에러:', frame);
    };

    client.onConnect = () => {
      console.log('🤝 웹소켓 연결 성공');

      client.subscribe(`/user/book/waiting-time`, (message: IMessage) => {
        console.log('🤝waiting-time 구독~!!');
        console.log('🤝waiting-time 수신된 메세지:', message.body);
        const response = JSON.parse(message.body);
        setQueueInfo(
          response.position,
          response.estimatedWaitingSeconds,
          response.usersAfter
        );
      });

      client.subscribe(`/user/book/notification`, (message: IMessage) => {
        console.log('🤝notification 구독~!!');
        console.log('🤝notification 수신된 메세지:', message.body);
        const response = JSON.parse(message.body);
        if (response === true) {
          router.push('./real/areaSelect');
        }
      });
    };

    client.activate();
    stompClient.current = client;

    return () => {
      if (client.connected) {
        client.deactivate();
      }
    };
  }, []);

  const enterQueue = async () => {
    try {
      const response = await api.post(`/api/v1/ticketing/queue`);
      console.log(`🤝 ${response.data} 번째로 대기열 진입 성공`);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          setError('이미 티켓팅에 참여하셨습니다.');
        } else {
          setError('티켓팅 참여 중 오류가 발생했습니다.');
        }
      }
    }
  };
  return {
    enterQueue,
  };
};
