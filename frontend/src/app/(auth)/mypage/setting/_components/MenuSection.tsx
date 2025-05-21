'use client';

import styles from '../page.module.scss';
import { useRouter } from 'next/navigation';
import { logout } from '@/api/auth/auth';
import { useDispatch as useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/userSlice';
import { UserInfo } from '@/types/user';

export default function MenuSection() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await logout();
    dispatch(setUser(null as unknown as UserInfo));
    router.push('/main');
  };

  const handleAlarmSetting = () => {
    router.push('/notification');
  };
  return (
    <div className={styles.menuSection}>
      <div className={styles.menuItem} onClick={handleAlarmSetting}>
        알림 설정
      </div>
      <div className={styles.menuItem} onClick={handleLogout}>
        로그아웃
      </div>
    </div>
  );
}
