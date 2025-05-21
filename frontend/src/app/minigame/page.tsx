import styles from './page.module.scss';
import CardButton from '@/components/common/CardButton/CardButton';

export default function MiniGamePage() {
  return (
    <div className={styles.container}>
      <div className={styles.titleWrapper}>
        <span className={styles.title}>연습 유형을 선택하세요</span>
      </div>
      <div className={styles.menuWrapper}>
        <div className={styles.menuGrid}>
          <CardButton
            imgSrc='/images/queue.png'
            imgAlt='대기열 입장 연습'
            title='대기열 입장'
            href='/minigame/queue'
          />

          <CardButton
            imgSrc='/images/seatGrape.png'
            imgAlt='좌석 선택 연습'
            title='좌석 선택'
            href='/minigame/grape'
          />
          <div className={styles.centerCard}>
            <CardButton
              imgSrc='/images/capcha.png'
              imgAlt='보안문자 연습'
              title='보안 문자'
              href='/minigame/securityMessage'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
