import styles from './MessageItem.module.scss';
import { Message } from '@/types/chat';

interface Props {
  message: Message;
  replyTo?: Message;
  onReply: () => void;
  onReplyClick?: () => void;
  showNickname?: boolean;
}

export default function MessageItem({
  message,
  replyTo,
  onReply,
  onReplyClick,
  showNickname = true,
}: Props) {
  const isMine = message.isMe;
  const wrapperClass = `${styles.messageWrapper} ${
    isMine ? styles.mine : styles.other
  }`;

  // 일반 메시지 렌더링
  const renderRegularMessage = () => (
    <>
      {!isMine && showNickname && (
        <div className={styles.nickname}>{message.nickname}</div>
      )}
      <div className={styles.bubbleRow}>
        {isMine && <span className={styles.meta}>{message.time}</span>}
        <div className={styles.bubble} onClick={onReply}>
          {message.content}
        </div>
        {!isMine && <span className={styles.meta}>{message.time}</span>}
      </div>
    </>
  );

  // 답글 메시지 렌더링
  const renderReplyMessage = () => (
    <>
      {!isMine && showNickname && (
        <div className={styles.nickname}>{message.nickname}</div>
      )}
      <div className={styles.bubbleRow}>
        <div className={styles.bubble}>
          <div
            className={styles.replyBox}
            onClick={(e) => {
              e.stopPropagation();
              if (onReplyClick) onReplyClick();
            }}
          >
            <div className={styles.replyContent}>
              {replyTo?.nickname} : {replyTo?.content}
            </div>
          </div>
          <hr className={styles.replyDivider} />
          <div className={styles.messageContent} onClick={onReply}>
            {message.content}
          </div>
        </div>
        <span className={styles.meta}>{message.time}</span>
      </div>
    </>
  );

  return (
    <div className={wrapperClass}>
      <div className={styles.message}>
        {replyTo ? renderReplyMessage() : renderRegularMessage()}
      </div>
    </div>
  );
}
