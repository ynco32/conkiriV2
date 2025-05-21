import styles from './layout.module.scss';
import { Suspense } from 'react';
import SelectorContainer from '../_components/SelectorContainer';
import WriteButton from '@/components/sight/WriteButton/WriteButton';

export default function SectionSelectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.selects}>
        <SelectorContainer />
      </div>
      {children}
      <WriteButton />
    </div>
  );
}
