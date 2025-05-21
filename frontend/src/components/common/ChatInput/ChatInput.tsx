// components/common/ChatInput/ChatInput.tsx
'use client';

import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import styles from './ChatInput.module.scss';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  buttonText?: string;
  isReplying?: boolean;
  onHeightChange?: (height: number) => void;
}

export interface ChatInputHandle {
  focusInput: () => void;
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  (
    {
      onSend,
      placeholder = '메시지 입력',
      buttonText = '전송',
      isReplying,
      onHeightChange,
    },
    ref
  ) => {
    const [input, setInput] = useState('');
    const [textareaHeight, setTextareaHeight] = useState('44px');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focusInput: () => {
        textareaRef.current?.focus();
      },
    }));

    useEffect(() => {
      onHeightChange?.(parseInt(textareaHeight));
    }, [textareaHeight]);

    const MAX_LENGTH = 200;

    const handleTextareaChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      const value = e.target.value;

      if (value.length > MAX_LENGTH) return; // 200자 초과시 무시

      setInput(value);

      // 높이 자동 조절
      e.target.style.height = '60px'; // 기본 높이로 초기화
      const scrollHeight = e.target.scrollHeight;
      const newHeight = Math.min(scrollHeight, 120) + 'px'; // 최대 높이 제한
      e.target.style.height = newHeight;
      setTextareaHeight(newHeight);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isMobile =
        typeof window !== 'undefined' &&
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (e.key === 'Enter') {
        if (isMobile) return; // 모바일은 줄바꿈
        if (!e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      }
    };

    const handleSend = () => {
      if (!input.trim()) return;

      onSend(input); // 입력된 메시지를 부모 컴포넌트로 전달
      setInput(''); // 입력 필드 초기화
      setTextareaHeight('60px');
      textareaRef.current?.focus();
    };

    return (
      <div className={styles.inputWrapper}>
        <div className={styles.inputRow}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${styles.messageInput} ${
              isReplying ? styles.replying : ''
            }`}
            style={{ height: textareaHeight }}
          />
          <div className={styles.sendButtonWrapper}>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={styles.sendButton}
            >
              {buttonText}
            </button>
            <div className={styles.lengthIndicator}>{input.length} / 200</div>
          </div>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
