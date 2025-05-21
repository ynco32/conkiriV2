'use client';

import React from 'react';
import styles from './MarkerOverlay.module.scss';
import { Marker, MarkerCategory } from '@/types/marker';

interface MarkerOverlayProps {
  marker: Marker;
  onClose: () => void;
}

export default function MarkerOverlay({ marker, onClose }: MarkerOverlayProps) {
  const { category, detail } = marker;

  // 카테고리에 따른 뱃지 텍스트
  const getCategoryBadgeText = (category: MarkerCategory): string => {
    switch (category) {
      case 'TOILET':
        return '화장실';
      case 'CONVENIENCE':
        return '편의시설';
      case 'STORAGE':
        return '물품 보관소';
      case 'TICKET':
        return '공연';
      default:
        return '시설';
    }
  };

  // 카테고리에 따른 뱃지 배경 색상 클래스
  const getCategoryBadgeClass = (category: MarkerCategory): string => {
    switch (category) {
      case 'TOILET':
        return styles.badgeToilet;
      case 'CONVENIENCE':
        return styles.badgeConvenience;
      case 'STORAGE':
        return styles.badgeStorage;
      case 'TICKET':
        return styles.badgeTicket;
      default:
        return '';
    }
  };

  // 카테고리에 따른 세부 정보 렌더링
  const renderDetails = () => {
    switch (category) {
      case 'TOILET':
        const toiletDetail = detail as any;
        return (
          <div className={styles.detailContent}>
            <h3>{toiletDetail?.name || '화장실'}</h3>
            <div className={styles.detailInfo}>
              {toiletDetail?.floor && <p>층: {toiletDetail.floor}층</p>}
              {toiletDetail?.stalls !== undefined && (
                <p>칸수: {toiletDetail.stalls}칸</p>
              )}
            </div>
          </div>
        );

      case 'CONVENIENCE':
        const convenienceDetail = detail as any;
        return (
          <div className={styles.detailContent}>
            <h3>{convenienceDetail?.category || '편의시설'}</h3>
            {convenienceDetail?.things && (
              <div className={styles.detailInfo}>
                <p>판매 물품: {convenienceDetail.things}</p>
              </div>
            )}
          </div>
        );

      case 'STORAGE':
        const storageDetail = detail as any;
        return (
          <div className={styles.detailContent}>
            <h3>{storageDetail?.name || '물품 보관소'}</h3>
            <div className={styles.detailInfo}>
              {storageDetail?.capacity && (
                <p>수용량: {storageDetail.capacity}개</p>
              )}
              {storageDetail?.fee && <p>이용료: {storageDetail.fee}</p>}
            </div>
          </div>
        );

      case 'TICKET':
        const ticketDetail = detail as any;
        return (
          <div className={styles.detailContent}>
            <h3>{ticketDetail?.name || '티켓 부스'}</h3>
            {ticketDetail?.openHours && (
              <div className={styles.detailInfo}>
                <p>운영 시간: {ticketDetail.openHours}</p>
              </div>
            )}
          </div>
        );

      default:
        return <div>정보가 없습니다.</div>;
    }
  };

  // 이벤트 중단을 위한 핸들러 (버블링 방지)
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.overlayContainer} onClick={handleContentClick}>
      <div className={styles.overlayContent}>
        {/* 뱃지 */}
        <div className={`${styles.badge} ${getCategoryBadgeClass(category)}`}>
          {getCategoryBadgeText(category)}
        </div>

        {/* 세부 정보 */}
        {renderDetails()}
      </div>
    </div>
  );
}
