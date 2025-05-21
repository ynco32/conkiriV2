import ProgressBar from '@/components/common/ProgressBar/ProgressBar';
import styles from './page.module.scss';
import SearchBar from '@/components/common/SearchBar/SearchBar';
import ConcertContainer from '@/app/login/concert/_components/ConcertContainer';

export default function ConcertPage() {
  return (
    <div className={styles.container}>
      <ProgressBar
        current={3}
        total={3}
        currentDescription={'콘서트 선택'}
        className={styles.progressBar}
      />
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>콘서트에 갈 예정이 있나요?</h2>
          <p className={styles.desc}>티켓팅 일정 알림을 보내드려요!</p>
        </div>
        <ConcertContainer />
      </div>
    </div>
  );
}
