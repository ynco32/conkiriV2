// src/hooks/useChatWebSocket.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { apiRequest } from '@/api/api';
import {
  ApiChatMessage,
  Message,
  SendMessageRequest,
  MessagesResponse,
} from '@/types/chat';

interface UseChatWebSocketProps {
  chatRoomId: number;
}

export function useChatWebSocket({ chatRoomId }: UseChatWebSocketProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redux에서 사용자 정보 가져오기
  const { data: userInfo } = useSelector((state: RootState) => state.user);

  // 웹소켓 클라이언트 및 구독 참조
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<any>(null);

  // 세션 스토리지 키
  const storageKey = `chat-messages-${chatRoomId}`;

  // API 메시지를 클라이언트 메시지로 변환하는 함수
  const convertApiMessageToClientMessage = useCallback(
    (apiMessage: ApiChatMessage): Message => {
      // 시간 포맷팅 (HH:MM 형식)
      const messageDate = new Date(apiMessage.createdAt);
      const formattedTime = `${messageDate
        .getHours()
        .toString()
        .padStart(2, '0')}:${messageDate
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      // 부모 메시지가 있는지 확인
      let replyTo: Message | undefined = undefined;
      if (apiMessage.parentMessageId || apiMessage.parentTempId) {
        replyTo = {
          id: apiMessage.parentMessageId || apiMessage.parentTempId || '', // parentMessageId가 없으면 parentTempId 사용
          tempId: apiMessage.parentTempId || '', // parentTempId가 없으면 빈 문자열
          nickname: apiMessage.parentSenderNickname || '',
          time: '',
          content: apiMessage.parentContent || '',
        };
      }

      // 내가 보낸 메시지인지 확인
      const isMe = apiMessage.senderId === userInfo?.userId;

      // messageId가 있으면 그대로 사용, 없으면 tempId를 id로 사용
      const id = apiMessage.messageId || apiMessage.tempId;

      return {
        id,
        tempId: apiMessage.tempId,
        nickname: apiMessage.senderNickname,
        time: formattedTime,
        createdAt: apiMessage.createdAt,
        content: apiMessage.content,
        isMe,
        replyTo,
      };
    },
    [userInfo?.userId]
  );

  // 초기 메시지 로드 함수
  const loadInitialMessages = useCallback(async () => {
    try {
      setIsLoading(true);

      // 세션 스토리지에서 캐시된 메시지 확인
      const cachedMessagesStr = sessionStorage.getItem(storageKey);
      let cachedMessages: Message[] = [];

      if (cachedMessagesStr) {
        try {
          cachedMessages = JSON.parse(cachedMessagesStr);
          // 임시로 캐시된 메시지 표시 (API 로드 전)
          setMessages(cachedMessages);
        } catch (e) {
          console.error('캐시된 메시지 파싱 오류:', e);
        }
      }

      // API로 최신 메시지 로드
      const response = await apiRequest<MessagesResponse>(
        'GET',
        `/api/v1/place/chat/chat-rooms/${chatRoomId}/messages`
      );

      if (response?.messages) {
        // API 메시지를 클라이언트 메시지로 변환
        const clientMessages = response.messages.map(
          convertApiMessageToClientMessage
        );

        // tempId 기반으로 parent 메시지 채우기
        const tempIdMap = new Map<string, Message>();
        clientMessages.forEach((msg) => {
          if (msg.tempId) {
            tempIdMap.set(msg.tempId, msg);
          }
        });

        const enrichedMessages = clientMessages.map((msg) => {
          if (
            msg.replyTo &&
            msg.replyTo.tempId &&
            (!msg.replyTo.content || !msg.replyTo.nickname)
          ) {
            const parent = tempIdMap.get(msg.replyTo.tempId);
            if (parent) {
              return {
                ...msg,
                replyTo: {
                  ...msg.replyTo,
                  content: parent.content,
                  nickname: parent.nickname,
                },
              };
            }
          }
          return msg;
        });

        // 세션 스토리지에 메시지 캐싱
        sessionStorage.setItem(storageKey, JSON.stringify(enrichedMessages));

        setMessages(enrichedMessages);
        setError(null);
      }
    } catch (err: any) {
      console.error('메시지 로드 오류:', err);
      setError(err.message || '메시지를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [chatRoomId, convertApiMessageToClientMessage, storageKey]);

  // 이전 메시지 로드 (무한 스크롤)
  const loadPreviousMessages = useCallback(
    async (message: Message, size: number = 50) => {
      if (isLoading) return false;

      try {
        setIsLoading(true);

        // ISO 형식으로 날짜 변환
        const beforeTime = message.createdAt;

        const response = await apiRequest<MessagesResponse>(
          'GET',
          `/api/v1/place/chat/chat-rooms/${chatRoomId}/messages/before`,
          undefined,
          { beforeTime, size }
        );

        if (response?.messages) {
          // API 메시지를 클라이언트 메시지로 변환
          const clientMessages = response.messages.map(
            convertApiMessageToClientMessage
          );

          // 중복 제거 후 메시지 목록 앞에 추가
          setMessages((prevMessages) => {
            const existingIds = new Set(prevMessages.map((msg) => msg.id));
            const existingTempIds = new Set(
              prevMessages.map((msg) => msg.tempId)
            );

            const newMessages = clientMessages.filter(
              (msg) =>
                !existingIds.has(msg.id) && !existingTempIds.has(msg.tempId)
            );
            const updatedMessages = [...newMessages, ...prevMessages];

            // 업데이트된 전체 메시지 캐싱
            sessionStorage.setItem(storageKey, JSON.stringify(updatedMessages));

            return updatedMessages;
          });

          return clientMessages.length > 0;
        }

        return false;
      } catch (err: any) {
        console.error('이전 메시지 로드 오류:', err);
        setError(
          err.message || '이전 메시지를 불러오는 중 오류가 발생했습니다.'
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [chatRoomId, convertApiMessageToClientMessage, isLoading, storageKey]
  );

  // 웹소켓 연결 설정
  useEffect(() => {
    // 이미 존재하는 클라이언트가 있다면 재사용
    if (clientRef.current && isConnected) {
      return;
    }

    // Redux 스토어에서 로그인 상태 확인
    const isLoggedInViaRedux = userInfo && userInfo.userId;
    console.log('Redux 로그인 상태:', !!isLoggedInViaRedux);

    // 인증 확인
    if (!isLoggedInViaRedux) {
      setError('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
      return;
    }

    try {
      console.log('채팅 웹소켓 연결 시도...');

      // API URL 구성
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const sockJsUrl = `${baseUrl}/place-ws`;
      console.log('사용할 웹소켓 URL:', sockJsUrl);

      // 연결 상태 변수
      let hasConnected = false;

      // SockJS 인스턴스 생성
      const socket = new SockJS(sockJsUrl);

      // SockJS 이벤트 리스너
      socket.onopen = () => {
        console.log('SockJS 소켓 열림');
        hasConnected = true;
      };

      socket.onclose = (event) => {
        console.log('SockJS 소켓 닫힘', event);
        console.log('닫힘 코드:', event.code);
        console.log('닫힘 이유:', event.reason || '이유 없음');

        if (!hasConnected) {
          console.error('소켓이 열리기 전에 닫힘');
          setError('서버 연결에 실패했습니다. 서버 상태를 확인해주세요.');
          setIsConnected(false);
        }
      };

      socket.onerror = (error) => {
        console.error('SockJS 소켓 오류:', error);
        setError('웹소켓 연결 중 오류가 발생했습니다.');
        setIsConnected(false);
      };

      // Stomp 클라이언트 생성
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => console.log('CHAT STOMP: ' + str),
        reconnectDelay: 10000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // 연결 성공 콜백
      client.onConnect = () => {
        console.log('웹소켓 연결 성공');
        setIsConnected(true);
        setError(null);

        // 채팅방 메시지 구독
        subscriptionRef.current = client.subscribe(
          `/topic/chat/${chatRoomId}`,
          (messageEvent) => {
            try {
              const receivedMessage = JSON.parse(
                messageEvent.body
              ) as ApiChatMessage;
              console.log('새 메시지 수신:', receivedMessage);

              // 중복 메시지 방지를 위한 ID 체크
              setMessages((prevMessages) => {
                // API 메시지를 클라이언트 메시지로 변환
                const clientMessage =
                  convertApiMessageToClientMessage(receivedMessage);

                // 메시지 배열에서 parentTempId에 해당하는 원본 찾아 채워 넣기
                if (
                  receivedMessage.parentTempId &&
                  (!receivedMessage.parentContent ||
                    !receivedMessage.parentSenderNickname)
                ) {
                  const original = prevMessages.find(
                    (msg) => msg.tempId === receivedMessage.parentTempId
                  );

                  if (original && clientMessage.replyTo) {
                    clientMessage.replyTo = {
                      ...clientMessage.replyTo,
                      content: original.content,
                      nickname: original.nickname,
                    };
                  }
                }

                const isDuplicate = prevMessages.some(
                  (msg) =>
                    (clientMessage.id && msg.id === clientMessage.id) ||
                    (clientMessage.tempId &&
                      msg.tempId === clientMessage.tempId)
                );

                if (isDuplicate) return prevMessages;

                const updatedMessages = [...prevMessages, { ...clientMessage }];
                sessionStorage.setItem(
                  storageKey,
                  JSON.stringify(updatedMessages)
                );
                return updatedMessages;
              });
            } catch (err) {
              console.error('메시지 처리 오류:', err);
            }
          }
        );

        // 연결 성공 후 초기 메시지 로드
        loadInitialMessages();
      };

      // 오류 처리
      client.onStompError = (frame) => {
        console.error('STOMP 오류:', frame);
        setError(`연결 오류: ${frame.headers.message}`);
        setIsConnected(false);
      };

      client.onWebSocketError = (event) => {
        console.error('웹소켓 오류:', event);
        setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        setIsConnected(false);
      };

      // 연결 시작
      client.activate();
      clientRef.current = client;

      // 컴포넌트 언마운트 시 실행될 정리 함수
      return () => {
        // 구독 해제
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }

        // disconnect 함수 호출하여 연결 완전히 해제
        disconnect();
      };
    } catch (err) {
      console.error('웹소켓 초기화 오류:', err);
      setError('연결 초기화 중 오류가 발생했습니다.');
      setIsConnected(false);
    }
  }, [
    chatRoomId,
    convertApiMessageToClientMessage,
    loadInitialMessages,
    storageKey,
    userInfo,
  ]);

  // 메시지 전송 함수
  const sendMessage = useCallback(
    (content: string, replyToMessage?: Message) => {
      if (!clientRef.current || !isConnected) {
        setError(
          '서버에 연결되어 있지 않습니다. 새로고침 후 다시 시도해주세요.'
        );
        return false;
      }

      if (!content.trim()) {
        return false;
      }

      try {
        // 전송할 메시지 데이터
        const messageRequest: SendMessageRequest = {
          content: content.trim(),
        };
        // 답글인 경우 부모 메시지 정보 추가
        if (replyToMessage) {
          // parentTempId 항상 추가 (가장 우선)
          if (replyToMessage.tempId) {
            messageRequest.parentTempId = replyToMessage.tempId;
          }

          // parentMessageId는 타입이 number인 경우에만 추가
          if (typeof replyToMessage.id === 'number') {
            messageRequest.parentMessageId = replyToMessage.id;
          }
        }

        console.log('메시지 전송:', messageRequest);

        // 웹소켓을 통해 메시지 전송
        clientRef.current.publish({
          destination: `/app/chat/${chatRoomId}`,
          body: JSON.stringify(messageRequest),
        });

        return true;
      } catch (err) {
        console.error('메시지 전송 오류:', err);
        setError('메시지 전송에 실패했습니다.');
        return false;
      }
    },
    [chatRoomId, isConnected]
  );

  // 연결 끊기 함수 (명시적으로 연결 해제 필요시)
  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // 재연결 함수
  const reconnect = useCallback(() => {
    if (!clientRef.current || !isConnected) {
      if (clientRef.current) {
        clientRef.current.activate();
      }
    }
  }, [isConnected]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    loadPreviousMessages,
    refreshMessages: loadInitialMessages,
    disconnect,
    reconnect,
  };
}
