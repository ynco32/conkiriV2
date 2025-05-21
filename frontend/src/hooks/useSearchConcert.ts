import { useState, useEffect, useCallback } from 'react';
import { concertApi } from '@/api/sight/concert';
import { concert } from '@/types/concert';

export const useSearchConcerts = () => {
  const [concerts, setConcerts] = useState<concert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchWord, setSearchWord] = useState<string>('');

  const searchConcerts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setConcerts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await concertApi.getConcerts(query);
      if (response.data && response.data.data) {
        setConcerts(response.data.data);
      } else {
        setConcerts([]);
      }
    } catch (err) {
      setError('콘서트 검색 중 오류가 발생했습니다.');
      console.error('콘서트 검색 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchWord) {
      const debounceTimer = setTimeout(() => {
        searchConcerts(searchWord);
      }, 300); // 300ms 디바운스

      return () => clearTimeout(debounceTimer);
    } else {
      setConcerts([]);
    }
  }, [searchWord, searchConcerts]);

  return {
    concerts,
    isLoading,
    error,
    searchWord,
    setSearchWord,
    searchConcerts,
  };
};
