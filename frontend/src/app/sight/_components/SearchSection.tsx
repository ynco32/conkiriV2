// app/sight/components/SearchSection.tsx
'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import SearchBar from '@/components/common/SearchBar/SearchBar';
import styles from '../page.module.scss';

interface SearchSectionProps {
  defaultQuery?: string;
}

export default function SearchSection({
  defaultQuery = '',
}: SearchSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSearch = (query: string) => {
    // API 호출을 위해 URL 파라미터 업데이트
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('searchWord', query);
    } else {
      params.delete('searchWord');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.search}>
      <SearchBar
        placeholder='공연장명 검색'
        fullWidth
        initialValue={defaultQuery}
        onSearch={handleSearch}
      />
    </div>
  );
}
