// src/hooks/useNotification.ts
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NotificationType } from '@/types/notification';
import { notificationApi } from '@/api/notification/notification';
import {
  setNotifications,
  setHasUnread,
  setLoading,
  setError,
  markAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
} from '@/store/slices/notificationSlice';
import { RootState } from '@/store';

/**
 * 알림 상태와 기본 CRUD 작업을 관리하는 훅
 */
export const useNotifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error, hasUnread } = useSelector(
    (state: RootState) => state.notification
  );

  /**
   * 알림 목록 가져오기
   */
  const fetchNotifications = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const response = await notificationApi.getAllNotification();
      dispatch(setNotifications(response || []));

      // 안 읽은 알림이 있는지 API 호출로 확인
      const unreadResponse = await notificationApi.hasUnreadNotification();
      dispatch(setHasUnread(unreadResponse || false));

      dispatch(setError(null));
    } catch (err) {
      dispatch(
        setError(
          err instanceof Error
            ? err
            : new Error('알림을 불러오는데 실패했습니다.')
        )
      );
      dispatch(setNotifications([]));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * 특정 알림 읽음 처리
   */
  const markAsRead = useCallback(
    async (notificationId: number | string) => {
      try {
        const idAsString = notificationId.toString();
        await notificationApi.readNotification(idAsString);
        dispatch(markAsReadAction(Number(idAsString)));

        // 읽음 처리 후 안 읽은 알림이 있는지 확인
        const unreadResponse = await notificationApi.hasUnreadNotification();
        dispatch(setHasUnread(unreadResponse || false));
      } catch (err) {
        console.error('알림 읽음 처리 실패:', err);
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * 모든 알림 읽음 처리
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.readAllNotifications();
      dispatch(markAllAsReadAction());
    } catch (err) {
      console.error('전체 알림 읽음 처리 실패:', err);
      throw err;
    }
  }, [dispatch]);

  /**
   * 새로운 알림 추가
   */
  const addNotification = useCallback(
    (notification: NotificationType) => {
      dispatch(setNotifications([notification, ...notifications]));
      dispatch(setHasUnread(true));
    },
    [dispatch, notifications]
  );

  /**
   * 특정 알림 삭제
   */
  const deleteNotification = useCallback(
    async (notificationId: number | string) => {
      try {
        const idAsString = notificationId.toString();
        await notificationApi.deleteNotification(idAsString);

        // 삭제 후 상태 업데이트
        dispatch(
          setNotifications(
            notifications.filter(
              (notification) =>
                notification.notificationId.toString() !== idAsString
            )
          )
        );

        // 삭제 후 안 읽은 알림이 있는지 확인
        const unreadResponse = await notificationApi.hasUnreadNotification();
        dispatch(setHasUnread(unreadResponse || false));

        return true;
      } catch (err) {
        console.error('알림 삭제 실패:', err);
        throw err;
      }
    },
    [dispatch, notifications]
  );

  /**
   * 모든 알림 삭제
   */
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationApi.deleteAllNotifications();
      dispatch(setNotifications([]));
      dispatch(setHasUnread(false));
      return true;
    } catch (err) {
      console.error('모든 알림 삭제 실패:', err);
      throw err;
    }
  }, [dispatch]);

  /**
   * 알림 권한 확인
   */
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const checkNotificationAccess = useCallback(async () => {
    try {
      const hasPermission = await notificationApi.checkNotificationAccess();
      setHasAccess(hasPermission || false);
      return hasPermission;
    } catch (err) {
      console.error('알림 권한 확인 실패:', err);
      setHasAccess(false);
      return false;
    }
  }, []);

  /**
   * 알림 권한 변경
   */
  const changeNotificationAccess = useCallback(async () => {
    try {
      await notificationApi.changeNotificationAccess();
      return true;
    } catch (err) {
      console.error('알림 권한 변경 실패:', err);
      throw err;
    }
  }, []);

  return {
    // 상태
    notifications,
    loading,
    error,
    hasUnread,
    hasAccess,
    // 작업
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    deleteNotification,
    deleteAllNotifications,
    checkNotificationAccess,
    changeNotificationAccess,
  };
};
