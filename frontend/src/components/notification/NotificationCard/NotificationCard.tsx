import React from 'react';
import { NotificationType, NotificationCategory } from '@/types/notification';
import styles from './NotificationCard.module.scss';

interface NotificationCardProps {
  notification: NotificationType;
  onActionClick?: () => void;
  isHighlighted?: boolean;
}

// 날짜 포맷팅 함수 (YYYY-MM-DD -> YYYY.MM.DD)
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.substring(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }
  return dateString;
};

/**
 * 알림 카드 컴포넌트
 */
const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onActionClick,
  isHighlighted = false,
}) => {
  const { title, body, type, createdAt, concert, isRead } = notification;

  return (
    <div
      className={`${styles.notificationCard} ${
        isRead ? styles.read : styles.unread
      } ${isHighlighted ? styles.highlighted : ''}`}
    >
      <div className={styles.cardContainer}>
        <div className={styles.leftIndicator}></div>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.category}>
              {notification.type || '아티스트명'}
            </div>
            <div className={styles.date}>{formatDate(createdAt)}</div>
          </div>

          <div className={styles.messageContent}>
            <p className={styles.body}>{body}</p>

            {concert && (
              <div className={styles.concertInfo}>
                <div className={styles.concertImage}>
                  {concert.photoUrl && (
                    <img src={concert.photoUrl} alt={concert.concertName} />
                  )}
                </div>
                <div className={styles.concertDetails}>
                  <div className={styles.concertName}>
                    {concert.concertName}
                  </div>
                  <div className={styles.artistName}>{concert.artistName}</div>
                </div>
              </div>
            )}

            {type === 'TICKETING_DAY' && (
              <button className={styles.actionButton} onClick={onActionClick}>
                예매하러 가기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
