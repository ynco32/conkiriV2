// app/sight/page.tsx
import { Suspense } from 'react';
import styles from './page.module.scss';
import SearchSection from './_components/SearchSection';
import ArenaSection from './_components/ArenaSection';
import ArenaLoadingFallback from './_components/ArenaLoadingFallback';

interface SightPageProps {
  searchParams: Promise<{
    searchWord?: string;
  }>;
}

export default async function SightPage({ searchParams }: SightPageProps) {
  const params = await searchParams;

  return (
    <div className={styles.container}>
      <Suspense fallback={null}>
        <SearchSection defaultQuery={params.searchWord} />
      </Suspense>

      <Suspense fallback={<ArenaLoadingFallback />}>
        <ArenaSection searchQuery={params.searchWord} />
      </Suspense>
    </div>
  );
}
