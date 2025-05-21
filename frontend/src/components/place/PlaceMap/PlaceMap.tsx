'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import TagButton from '@/components/common/TagButton/TagButton';
import styles from './PlaceMap.module.scss';
import useKakaoMap from '@/hooks/useKakaoMap';
import IconButton from '@/components/common/IconButton/IconButton';
import { useAppDispatch } from '@/store/reduxHooks';
import { updateMapSettings } from '@/store/slices/arenaSlice';
import ChatbotButton from '@/components/chatbot/ChatbotButton/ChatbotButton';
import { useChatbot } from '@/components/chatbot/ChatbotProvider/ChatbotProvider';
import useMarkers, { UICategoryType } from '@/hooks/useMarkers';
import { MarkerCategory, Marker } from '@/types/marker';
import MarkerOverlay from '../MarkerOverlay/MarkerOverlay';

interface PlaceMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  arenaId: string | number;
}

export default function PlaceMap({
  latitude,
  longitude,
  zoom = 3,
  arenaId,
}: PlaceMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const userMarkerRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const markerRefs = useRef<{ [key: number]: kakao.maps.Marker }>({});
  const dispatch = useAppDispatch();
  const { openChatbot } = useChatbot();
  const [mapLevel, setMapLevel] = useState(zoom);

  // 마커 데이터 가져오기 (이제 Redux를 통해 가져옴)
  const {
    markers,
    loading,
    error,
    categories,
    categoryLabels,
    activeCategory,
    setActiveCategory,
  } = useMarkers(arenaId);

  const { map } = useKakaoMap(mapRef, {
    center: { lat: latitude, lng: longitude },
    level: zoom,
    maxLevel: 5,
    minLevel: 1,
  });

  // 지도 이동 시 Redux 상태 업데이트 (사용자가 직접 움직일 때)
  useEffect(() => {
    if (!map) return;

    const handleMapMove = () => {
      const center = map.getCenter();
      const level = map.getLevel();

      dispatch(
        updateMapSettings({
          latitude: center.getLat(),
          longitude: center.getLng(),
          zoom: level,
        })
      );
    };

    // 지도 이동/줌 이벤트 리스너 등록
    window.kakao.maps.event.addListener(map, 'dragend', handleMapMove);
    window.kakao.maps.event.addListener(map, 'zoom_changed', handleMapMove);

    return () => {
      // 이벤트 리스너 제거
      window.kakao.maps.event.removeListener(map, 'dragend', handleMapMove);
      window.kakao.maps.event.removeListener(
        map,
        'zoom_changed',
        handleMapMove
      );
    };
  }, [map, dispatch]);

  // Redux 상태가 변경될 때 지도 이동 (헤더 클릭 등)
  useEffect(() => {
    if (!map) return;

    const center = new window.kakao.maps.LatLng(latitude, longitude);
    map.setCenter(center);
    map.setLevel(zoom);
  }, [map, latitude, longitude, zoom]);

  // 내 위치 이동 함수
  const moveToMyLocation = () => {
    if (!map || !navigator.geolocation) {
      alert('위치 서비스를 사용할 수 없습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latlng = new window.kakao.maps.LatLng(latitude, longitude);

        // 기존 마커 제거
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }

        // 현재 위치 표시용 HTML 엘리먼트 생성
        const content = document.createElement('div');
        content.className = styles.myLocationMarker;

        // 커스텀 오버레이로 현재 위치 표시
        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: latlng,
          content: content,
          map: map,
          zIndex: 10,
        });

        userMarkerRef.current = customOverlay;

        // 지도 중심 이동
        map.setCenter(latlng);
      },
      (err) => {
        alert('위치 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // 오버레이 닫기 함수
  const closeOverlay = () => {
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }
  };

  // 지도 클릭 시 오버레이 닫기 (한 번만 등록)
  useEffect(() => {
    if (!map) return;

    const handleClickMap = () => {
      closeOverlay();
    };

    window.kakao.maps.event.addListener(map, 'click', handleClickMap);
  }, [map]);

  // 카테고리에 따른 마커 이미지 URL 가져오기
  const getMarkerImageByCategory = (category: MarkerCategory) => {
    switch (category) {
      case 'TOILET':
        return '/svgs/place/marker1.svg';
      case 'STORAGE':
        return '/svgs/place/marker2.svg';
      case 'CONVENIENCE':
        return '/svgs/place/marker3.svg';
      case 'TICKET':
        return '/svgs/place/marker4.svg';
      default:
        return '/svgs/place/marker1.svg';
    }
  };

  // 오버레이 생성 함수 (React 컴포넌트로 렌더링)
  const createMarkerOverlay = useCallback(
    (marker: Marker, position: any) => {
      // 기존 오버레이 닫기
      closeOverlay();

      // 오버레이 컨테이너 생성
      const overlayContainer = document.createElement('div');
      overlayContainer.className = styles.overlayContainer;
      overlayContainer.style.cssText = `
        position: relative;
        transform: translate(-50%, -160%);
        margin-bottom: 20px;
        pointer-events: auto;
      `;

      // React 컴포넌트를 오버레이 컨테이너에 렌더링
      createRoot(overlayContainer).render(
        <MarkerOverlay
          marker={marker}
          onClose={() => {
            closeOverlay();
          }}
        />
      );

      // 오버레이 생성 및 반환
      return new window.kakao.maps.CustomOverlay({
        content: overlayContainer,
        position: position,
        xAnchor: 0.5,
        yAnchor: 0,
        zIndex: 3,
        map: map,
      });
    },
    [map]
  );

  // 마커 + 오버레이 렌더링
  useEffect(() => {
    if (!map || loading) return;

    // 기존 오버레이 닫기
    closeOverlay();

    // 기존 마커 제거
    Object.values(markerRefs.current).forEach((marker) => {
      marker.setMap(null);
    });
    markerRefs.current = {};

    // 새로운 마커 추가
    markers.forEach((markerData) => {
      const position = new window.kakao.maps.LatLng(
        markerData.latitude,
        markerData.longitude
      );

      // 마커 이미지 설정 (카테고리별 다른 이미지)
      const imageUrl = getMarkerImageByCategory(markerData.category);
      const imageSize = new window.kakao.maps.Size(32, 36); // 종횡비 유지
      const imageOption = { offset: new window.kakao.maps.Point(16, 36) }; // 마커 중심 좌표

      const markerImage = new window.kakao.maps.MarkerImage(
        imageUrl,
        imageSize,
        imageOption
      );

      const marker = new window.kakao.maps.Marker({
        map,
        position,
        title: getMarkerTitle(markerData),
        image: markerImage,
      });

      // 마커 클릭 이벤트 - createMarkerOverlay 함수 사용
      window.kakao.maps.event.addListener(marker, 'click', (e: any) => {
        const overlay = createMarkerOverlay(markerData, position);
        overlayRef.current = overlay;
      });

      // 마커 참조 저장
      markerRefs.current[markerData.markerId] = marker;
    });

    return () => {
      // 마커 제거
      Object.values(markerRefs.current).forEach((marker) => {
        marker.setMap(null);
      });
      markerRefs.current = {};
    };
  }, [map, markers, activeCategory, loading, mapLevel, createMarkerOverlay]);

  // 마커 타이틀 생성 함수
  const getMarkerTitle = (marker: (typeof markers)[0]) => {
    switch (marker.category) {
      case 'TOILET':
        return (marker.detail as any)?.name || '화장실';
      case 'CONVENIENCE':
        return `${(marker.detail as any)?.category || '편의시설'}`;
      case 'STORAGE':
        return (marker.detail as any)?.name || '물품 보관소';
      case 'TICKET':
        return (marker.detail as any)?.name || '티켓 부스';
      default:
        return '시설';
    }
  };

  if (error) {
    return (
      <div className={styles.error}>마커 정보를 가져오는데 실패했습니다.</div>
    );
  }

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.categoryBar}>
        {categories.map((category) => (
          <TagButton
            key={category}
            onClick={() => setActiveCategory(category)}
            type={activeCategory === category ? 'active' : 'default'}
          >
            {categoryLabels[category]}
          </TagButton>
        ))}
      </div>

      <IconButton
        icon='gps'
        onClick={moveToMyLocation}
        className={styles.myLocationBtn}
        iconSize={30}
        variant='medium'
      />

      <ChatbotButton onClick={openChatbot} />

      <div ref={mapRef} className={styles.kakaoMap} />
    </div>
  );
}
