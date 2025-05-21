import { useEffect, useState } from 'react';

interface MapOptions {
  center: { lat: number; lng: number };
  level: number;
  maxLevel?: number;
  minLevel?: number;
}

export default function useKakaoMap(
  mapRef: React.RefObject<HTMLDivElement | null>,
  options: MapOptions
) {
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const kakaoMapLoad = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;

        const kakaoMap = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(
            options.center.lat,
            options.center.lng
          ),
          level: options.level,
          maxLevel: options.maxLevel,
          minLevel: options.minLevel,
        });

        setMap(kakaoMap);
        setLoading(false);
      });
    };

    // 1. 스크립트가 이미 로드되어 있으면 바로 사용
    if (window.kakao && window.kakao.maps) {
      kakaoMapLoad();
    } else {
      // 2. 스크립트가 없으면 동적으로 추가
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
      script.async = true;
      script.onload = kakaoMapLoad;
      script.onerror = () => setError(new Error('카카오맵 스크립트 로드 실패'));
      document.head.appendChild(script);
    }
  }, [mapRef]);

  return { map, loading, error };
}
