import styles from './page.module.scss';
import MyPageArtistContainer from './_components/MyPageArtistContainer';
import { Suspense } from 'react';
import ArtistLoadingFallback from './_components/ArtistLoadingFallback';

export default function MyPageArtists() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>좋아하는 아티스트를 알려주세요!</h2>
          <p className={styles.desc}>공연일정을 안내받을 수 있어요.</p>
        </div>
        <Suspense fallback={<ArtistLoadingFallback />}>
          <MyPageArtistContainer />
        </Suspense>
      </div>
    </div>
  );
}
