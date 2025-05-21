// src/types/notification.ts

export interface NotificationType {
  notificationId: number;
  title: string;
  body: string;
  type: NotificationCategory;
  isRead: boolean;
  createdAt: string;
  concert?: Concert;
}

export interface Concert {
  concertId: number;
  concertName: string;
  artistName: string;
  photoUrl: string;
}

export type NotificationCategory =
  | 'TICKETING_DAY'
  | 'TICKETING_SOON'
  | 'CONCERT_DAY'
  | 'SYSTEM';

export interface NotificationResponse {
  data: Notification[];
}
