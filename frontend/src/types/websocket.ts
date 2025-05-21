// src/types/websocket.ts
export interface WaitingTimeApiResponse {
  data: WaitingTimeData;
  error: { code: string; message: string } | null;
  meta: { timestamp: string };
}

export interface WaitingTimeData {
  position: number;
  estimatedWaitingSeconds: number;
  usersAfter: number;
}

export interface NotificationApiResponse {
  data: boolean;
  error: { code: string; message: string } | null;
  meta: { timestamp: string };
}
