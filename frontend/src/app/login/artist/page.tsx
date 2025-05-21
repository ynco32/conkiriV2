import ProgressBar from '@/components/common/ProgressBar/ProgressBar';
import styles from './page.module.scss';
import ArtistContainer from './_components/ArtistContainer';

export default function ArtistPage() {
  return (
    <div className={styles.container}>
      <ProgressBar
        current={2}
        total={3}
        currentDescription={'아티스트 선택'}
        className={styles.progressBar}
      />
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>좋아하는 아티스트를 알려주세요!</h2>
          <p className={styles.desc}>공연일정을 안내받을 수 있어요.</p>
        </div>
        <ArtistContainer />
      </div>
    </div>
  );
}
