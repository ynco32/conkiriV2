// app/arena/loading.tsx
import styles from './page.module.scss';

export default function Loading() {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner}>로딩 중...</div>
    </div>
  );
}
