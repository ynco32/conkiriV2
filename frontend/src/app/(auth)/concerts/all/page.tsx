import styles from './page.module.scss';
import MyPageConcertContainer from '@/app/(auth)/concerts/all/_components/MyPageConcertContainer';

export default function MyPageConcerts() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>콘서트에 갈 예정이 있나요?</h2>
          <p className={styles.desc}>티켓팅 일정 알림을 보내드려요!</p>
        </div>
        <MyPageConcertContainer />
      </div>
    </div>
  );
}
