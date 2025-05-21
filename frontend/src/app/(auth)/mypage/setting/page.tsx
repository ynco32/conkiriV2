// app/mypage/setting/page.tsx
import styles from './page.module.scss';
import MenuSection from './_components/MenuSection';
import ProfileSection from './_components/ProfileSection';
import { Suspense } from 'react';
import ProfileSectionSkeleton from './_components/ProfileSectionSkeleton';
import MenuSectionSkeleton from './_components/MenuSectionSkeleton';

export default function MyPageSetting() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<ProfileSectionSkeleton />}>
        <ProfileSection />
      </Suspense>
      <Suspense fallback={<MenuSectionSkeleton />}>
        <MenuSection />
      </Suspense>
    </div>
  );
}
