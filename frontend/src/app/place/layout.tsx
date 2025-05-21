import styles from './layout.module.scss';
export default function PlaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className={styles.bgWrapper} />
      <div className={styles.container}>
        <div className={styles.contentWrapper}>{children}</div>
      </div>
    </>
  );
}
