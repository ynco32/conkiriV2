import { apiRequest } from '@/api/api';
import { NotificationType } from '@/types/notification';

export const notificationApi = {
  /**
   *
   * @param token
   * FCM 토큰 등록
   */
  sendFCMToken: (token: string) =>
    apiRequest<null>('POST', '/api/v1/notifications/fcm-token', {
      fcmToken: token,
    }),

  /**
   * 전체 알림 조회
   */
  getAllNotification: () =>
    apiRequest<NotificationType[]>('GET', '/api/v1/notifications'),

  /**
   * 안 읽은 알림이 있는지 조회
   */
  hasUnreadNotification: () =>
    apiRequest<boolean>('GET', '/api/v1/notifications/unread'),

  /**
   * 알림 권한 확인
   */
  checkNotificationAccess: () =>
    apiRequest<boolean>('GET', '/api/v1/notifications/settings'),

  /**
   * 알림 권한 변경
   */
  changeNotificationAccess: () =>
    apiRequest<null>('PATCH', '/api/v1/notifications/settings'),

  /**
   * 특정 알림 읽음 처리
   * @param notificationId 알림 아이디
   */
  readNotification: (notificationId: string) =>
    apiRequest<null>('PATCH', `/api/v1/notifications/${notificationId}/read`),

  /**
   * 전체 알림 읽음 처리
   */
  readAllNotifications: () =>
    apiRequest<null>('PATCH', '/api/v1/notifications/read-all'),

  /**
   * 전체 알림 삭제 처리
   */
  deleteAllNotifications: () =>
    apiRequest<null>('DELETE', '/api/v1/notifications'),

  /**
   *
   * @param notificationId
   * @returns
   */
  deleteNotification: (notificationId: string) =>
    apiRequest<null>('DELETE', `/api/v1/notifications/${notificationId}`),
};
