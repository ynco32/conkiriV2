import styles from './page.module.scss';
import CardButton from '@/components/common/CardButton/CardButton';
import RealModeButton from '@/components/ticketing/RealModeButton/RealModeButton';

export default function TicketingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.titleWrapper}>
        <span className={styles.title}>연습할 플랫폼을 선택해주세요</span>
      </div>
      <div className={styles.platformWrapper}>
        <div className={styles.menuFlex}>
          <CardButton
            imgSrc='/images/dummy.png'
            imgAlt='M 티켓'
            href='/ticketing/mTicket'
            size={72}
          />
          <CardButton
            imgSrc='/images/seatGrape.png'
            imgAlt='N 티켓'
            href='/'
            size={72}
          />
          <CardButton
            imgSrc='/images/capcha.png'
            imgAlt='C 티켓'
            href='/'
            size={72}
          />
          <CardButton
            imgSrc='/images/capcha.png'
            imgAlt='Y 티켓'
            href='/'
            size={72}
          />
        </div>
        <div className={styles.eventWrapper}>
          <RealModeButton
            imgSrc='/images/event_banner.png'
            imgAlt='이벤트'
            href='/ticketing/real'
            title='아이유: 더 워너 UAENA DAY'
            date='4/26 토요일'
            time='20:00'
            status='실전 연습 오픈!'
          />
        </div>
      </div>
    </div>
  );
}
