import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArtistInfo } from '@/types/mypage';
import { getArtists, getMyArtists, editArtist } from '@/api/mypage/mypage';
import { ExceptionResponse } from '@/types/api';

export const useMypageArtist = () => {
  const router = useRouter();

  const [artists, setArtists] = useState<ArtistInfo[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadDone = useRef<boolean>(false);

  const fetchArtists = async (query: string = '', lastId?: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // 초기 로딩시에만 내가 팔로잉하는 아티스트 목록 가져오기
      if (!initialLoadDone.current) {
        const selectedArtistResponse = await getMyArtists();
        if (selectedArtistResponse?.artists) {
          // 중복 없이 selected 배열 설정
          const myArtistIds = selectedArtistResponse.artists.map(
            (artist) => artist.artistId
          );
          setSelected(myArtistIds);
          initialLoadDone.current = true;

          // 이제 아티스트 목록을 가져옵니다
          const artistResponse = await getArtists(query || undefined, lastId);

          if (lastId) {
            setArtists((prev) => {
              const newArtists = artistResponse?.artists ?? [];
              const uniqueNewArtists = newArtists.filter(
                (newArtist) =>
                  !prev.some(
                    (existingArtist) =>
                      existingArtist.artistId === newArtist.artistId
                  )
              );

              const updatedArtists = [...prev, ...uniqueNewArtists];

              // selected 배열을 기준으로 isFollowing 상태 설정
              return updatedArtists.map((artist) => ({
                ...artist,
                isFollowing: myArtistIds.includes(artist.artistId),
              }));
            });
          } else {
            // 초기 로딩이나 검색으로 데이터를 새로 불러오는 경우
            const updatedArtists = (artistResponse?.artists ?? []).map(
              (artist) => ({
                ...artist,
                isFollowing: myArtistIds.includes(artist.artistId),
              })
            );
            setArtists(updatedArtists);
          }

          setIsLastPage(artistResponse?.isLastPage ?? true);
          return; // 초기 로딩 완료 후 함수 종료
        }
      }

      // 초기 로딩이 아니거나 초기 로딩에 실패한 경우
      const artistResponse = await getArtists(query || undefined, lastId);

      if (lastId) {
        // 무한 스크롤로 추가 데이터를 불러오는 경우
        setArtists((prev) => {
          const newArtists = artistResponse?.artists ?? [];
          // 이미 불러온 아티스트는 제외하고 추가
          const uniqueNewArtists = newArtists.filter(
            (newArtist) =>
              !prev.some(
                (existingArtist) =>
                  existingArtist.artistId === newArtist.artistId
              )
          );

          // 기존 아티스트 배열과 새로운 아티스트 배열 합치기
          const updatedArtists = [...prev, ...uniqueNewArtists];

          // selected 배열을 기준으로 isFollowing 상태 설정
          return updatedArtists.map((artist) => ({
            ...artist,
            isFollowing: selected.includes(artist.artistId),
          }));
        });
      } else {
        // 초기 로딩이 아닌 검색으로 데이터를 새로 불러오는 경우
        const updatedArtists = (artistResponse?.artists ?? []).map(
          (artist) => ({
            ...artist,
            isFollowing: selected.includes(artist.artistId),
          })
        );
        setArtists(updatedArtists);
      }

      setIsLastPage(artistResponse?.isLastPage ?? true);
    } catch (error) {
      const apiError = error as ExceptionResponse;
      if (apiError.statusCode === 401) {
        alert('로그인이 필요합니다.');
        router.replace('/onboarding');
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await editArtist(selected);
      router.replace('/mypage');
    } catch (error) {
      const apiError = error as ExceptionResponse;
      if (apiError.statusCode === 401) {
        alert('로그인이 필요합니다.');
        router.replace('/onboarding');
        return;
      }

      if (apiError.statusCode === 400) {
        alert('잘못된 요청입니다.');
        return;
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // 기존 타이머가 있다면 제거
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // 1초 후에 검색 실행하는 타이머 설정
    searchTimerRef.current = setTimeout(() => {
      fetchArtists(query);
    }, 500);
  };

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !isLastPage && !isLoading) {
        const lastId = artists[artists.length - 1]?.artistId;
        if (lastId) {
          fetchArtists(searchQuery, lastId);
        }
      }
    },
    [artists, isLastPage, isLoading, searchQuery]
  );

  const handleSelect = (id: number) => {
    // 아티스트 배열에서 해당 아티스트의 isFollowing 상태를 토글
    setArtists((prev) =>
      prev.map((artist) => {
        if (artist.artistId === id) {
          return { ...artist, isFollowing: !artist.isFollowing };
        }
        return artist;
      })
    );

    // selected 배열도 함께 업데이트
    setSelected((prev) => {
      // 이미 선택되어 있으면 제거, 없으면 추가
      if (prev.includes(id)) {
        return prev.filter((artistId) => artistId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetchArtists();
  }, []);

  // 인피니트 스크롤 설정
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  return {
    artists,
    selected,
    isLoading,
    loadMoreRef,
    handleSearch,
    handleSelect,
    handleSubmit,
  };
};
