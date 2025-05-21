'use client';
import TextInput from '@/components/common/TextInput/TextInput';
import ProgressBar from '@/components/common/ProgressBar/ProgressBar';
import styles from './page.module.scss';
import Button from '@/components/common/Button/Button';
import { useNickname } from '@/hooks/useNickname';

export default function NicknamePage() {
  const {
    nickname,
    error,
    isChecked,
    isAvailable,
    isLoading,
    handleChange,
    handleCheck,
    handleSubmit,
  } = useNickname();

  return (
    <div className={styles.container}>
      <ProgressBar current={1} total={3} currentDescription={'닉네임 입력'} />
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>닉네임을 지어주세요!</h2>
          <p className={styles.desc}>좌석 후기 및 나눔글에서 사용돼요.</p>
        </div>
        <div className={styles.form}>
          <TextInput
            value={nickname}
            onChange={handleChange}
            maxLength={11}
            placeholder='닉네임을 입력해주세요'
            className={styles.input}
            errorMessage={!isAvailable ? error : ''}
            successMessage={
              isAvailable && isChecked ? '사용가능한 닉네임이에요!' : ''
            }
            disabled={isLoading}
          />
          {!isAvailable || !isChecked ? (
            <Button
              children={isLoading ? '확인 중...' : '중복확인'}
              variant='outline'
              className={styles.button}
              onClick={handleCheck}
              disabled={nickname.length < 2 || !!error || isLoading}
            />
          ) : (
            <Button
              children={isLoading ? '처리 중...' : '확인'}
              variant='primary'
              className={styles.button}
              onClick={handleSubmit}
              disabled={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
