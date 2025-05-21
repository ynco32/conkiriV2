'use client';

import IconButton from '@/components/common/IconButton/IconButton';
import styles from './WriteButton.module.scss';
import { useRouter } from 'next/navigation';

export default function WriteButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/sight/reviews/write');
  };

  return (
    <IconButton
      icon='write'
      variant='large'
      className={styles.write}
      onClick={handleClick}
    />
  );
}
