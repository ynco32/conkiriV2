import { Suspense } from 'react';
import styles from './page.module.scss';
import SearchSection from '@/app/sight/_components/SearchSection';
import ArenaSection from '@/app/sight/_components/ArenaSection';
import ArenaLoadingFallback from '@/app/sight/_components/ArenaLoadingFallback';

interface PlacePageProps {
  searchParams: Promise<{
    searchWord?: string;
  }>;
}

export default async function PlacePage({ searchParams }: PlacePageProps) {
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
