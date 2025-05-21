import { serverApiClient } from '@/api/api';
import { ArenaInfo, ArenaListResponse } from '@/types/arena';
import ArenaList from '@/components/common/ArenaList/ArenaList';
import styles from '../page.module.scss';

interface ArenaSectionProps {
  searchQuery?: string;
}

async function getArenas(searchQuery?: string): Promise<ArenaInfo[]> {
  try {
    const endpoint = searchQuery
      ? `/api/v1/arena/arenas?searchWord=${encodeURIComponent(searchQuery)}`
      : '/api/v1/arena/arenas';

    const response = await serverApiClient.get<ArenaListResponse>(endpoint);
    return response.data.data.arenas;
  } catch (error) {
    console.error('Error fetching arenas:', error);
    return [];
  }
}

export default async function ArenaSection({ searchQuery }: ArenaSectionProps) {
  const arenas = await getArenas(searchQuery);

  if (arenas.length === 0) {
    return (
      <div className={styles.arenaList}>
        {searchQuery ? (
          <div className={styles.noResults}>
            '{searchQuery}'에 대한 검색 결과가 없습니다.
          </div>
        ) : (
          <div className={styles.noResults}>
            공연장 목록을 불러올 수 없습니다.
          </div>
        )}
      </div>
    );
  }

  return <ArenaList arenas={arenas} />;
}
