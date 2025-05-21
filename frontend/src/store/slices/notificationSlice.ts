import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationType } from '@/types/notification';

interface NotificationState {
  notifications: NotificationType[];
  hasUnread: boolean;
  loading: boolean;
  error: Error | null;
}

const initialState: NotificationState = {
  notifications: [],
  hasUnread: false,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<NotificationType[]>) => {
      state.notifications = action.payload;
    },
    setHasUnread: (state, action: PayloadAction<boolean>) => {
      state.hasUnread = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<Error | null>) => {
      state.error = action.payload;
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(
        (n) => n.notificationId === action.payload
      );
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.isRead = true;
      });
      state.hasUnread = false;
    },
  },
});

export const {
  setNotifications,
  setHasUnread,
  setLoading,
  setError,
  markAsRead,
  markAllAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer; 