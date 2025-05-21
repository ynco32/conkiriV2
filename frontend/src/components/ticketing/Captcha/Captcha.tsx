import { useEffect, useState } from 'react';
import styles from './Captcha.module.scss';

interface CaptchaProps {
  isOpen: boolean;
  onPostpone: () => void; // 나중에 입력으로 미루는 경우
  onSuccess: () => void; // 보안 문자 잘 쳐서 들어가는 경우
  className?: string;
}

export default function Captcha({
  isOpen,
  onPostpone,
  onSuccess,
  className,
}: CaptchaProps) {
  const [captchaText, setCaptchaText] = useState('');
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null; // 닫혀있으면 null 리턴해서 팝업 닫기

  // 텍스트 생성
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setInputText('');
    setError(false);
  };

  // 음성 읽기 기능
  const speakCaptcha = () => {
    const utterance = new SpeechSynthesisUtterance(captchaText);
    window.speechSynthesis.speak(utterance);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toUpperCase();
    setInputText(inputValue);
    if (error) setError(false);
  };

  const handleSubmit = () => {
    if (captchaText === inputText) {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className={`${styles.captchaOverlay} ${className || ''}`}>
      <div className={styles.captchaContainer}>
        <h2 className={styles.captchaTitle}>인증예매</h2>

        <div className={styles.captchaContent}>
          <p className={styles.captchaInfo}>
            부정예매 방지를 위해 보안문자를 정확히 입력해주세요.
          </p>

          <div className={styles.captchaDisplay}>
            <div className={styles.captchaText}>{captchaText}</div>
            <div className={styles.captchaActions}>
              <button
                onClick={generateCaptcha}
                className={styles.actionButton}
                aria-label='새로고침'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                  />
                </svg>
              </button>
              <button
                onClick={speakCaptcha}
                className={styles.actionButton}
                aria-label='소리로 듣기'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
                  />
                </svg>
              </button>
            </div>
          </div>

          <input
            type='text'
            value={inputText}
            onChange={handleInputChange}
            placeholder='대소문자 구분없이 문자입력'
            maxLength={8}
            className={styles.captchaInput}
          />

          {error && (
            <p className={styles.errorMessage}>문자를 정확히 입력하세요</p>
          )}

          <div className={styles.submitButton}>
            <button onClick={handleSubmit}>입력완료</button>
          </div>

          <button className={styles.postponeButton} onClick={onPostpone}>
            <span>좌석 먼저 확인하고 나중에 입력하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
