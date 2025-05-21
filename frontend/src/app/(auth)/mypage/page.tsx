import React from 'react';
import MyPageContent from './MyPageContent';
import { Suspense } from 'react';
import MyPageSkeleton from './MyPageSkeleton';

// 클라이언트 컴포넌트로 책임 이전
export default function MyPageRoute() {
  return (
    <Suspense fallback={<MyPageSkeleton />}>
      <MyPageContent />
    </Suspense>
  );
}
