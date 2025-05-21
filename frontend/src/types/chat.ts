// src/types/chat.ts

// 서버 API 응답 메시지 타입
export interface ApiChatMessage {
  messageId?: number;
  tempId: string;
  senderId: number;
  senderNickname: string;
  content: string;
  parentMessageId?: number;
  parentTempId?: string;
  parentContent?: string;
  parentSenderNickname?: string;
  createdAt: string;
}

// 클라이언트에서 사용할 메시지 타입 (MessageItem 컴포넌트와 호환)
export interface Message {
  id: number | string; // messageId로 매핑
  tempId?: string;
  nickname: string; // senderNickname으로 매핑
  time: string; // createdAt을 포맷팅
  createdAt?: string;
  content: string; // content 그대로 사용
  isMe?: boolean; // senderId와 현재 사용자 ID 비교
  replyTo?: Message; // 부모 메시지가 있는 경우 변환
  isSystem?: boolean;
}

// 메시지 전송 요청 타입
export interface SendMessageRequest {
  content: string;
  parentMessageId?: number;
  parentTempId?: string;
}

// 메시지 목록 응답 타입
export interface MessagesResponse {
  messages: ApiChatMessage[];
}
