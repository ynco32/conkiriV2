'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import IconBox from '@/components/common/IconBox/IconBox';
import ConcertCard from '@/components/common/ConcertCard/ConcertCard';
import styles from './ConcertSection.module.scss';
import { ConcertInfo } from '@/types/mypage';
import { deleteConcert, getMyConcerts } from '@/api/mypage/mypage';

interface ConcertSectionProps {
  onCountChange: (count: number) => void;
}

// 스켈레톤 콘서트 카드 컴포넌트
const SkeletonConcertCard = () => {
  return (
    <div className={styles.concertCard}>
      <div className={styles.skeletonConcert}>
        <div className={styles.skeletonPoster}></div>
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonSubtitle}></div>
        </div>
      </div>
    </div>
  );
};

export default function ConcertSection({ onCountChange }: ConcertSectionProps) {
  const [concerts, setConcerts] = useState<ConcertInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditConcert = () => {
    setIsEditing(!isEditing);
  };

  const handleDeleteConcert = async (concertId: number) => {
    try {
      // 낙관적 업데이트: 서버 응답을 기다리지 않고 UI를 먼저 업데이트
      const updatedConcerts = concerts.filter(
        (concert) => concert.concertId !== concertId
      );
      setConcerts(updatedConcerts);
      onCountChange(updatedConcerts.length);

      // 서버에 삭제 요청
      await deleteConcert(concertId);
    } catch (error) {
      // 실패 시 원래 상태로 복구
      const response = await getMyConcerts();
      const concertsData = response?.concerts || [];
      setConcerts(concertsData);
      onCountChange(concertsData.length);
      console.error('콘서트 삭제 실패:', error);
    }
  };

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const response = await getMyConcerts();
        const concertsData = response?.concerts || [];
        setConcerts(concertsData);
        onCountChange(concertsData.length);
      } catch (error) {
        console.error('콘서트 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, [onCountChange]);

  // 초기 로딩 시에만 스켈레톤 UI 표시
  if (loading && concerts.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <IconBox name='calendar' size={24} color='#4986e8' />
            <h2 className={styles.title}>예정된 콘서트</h2>
          </div>
          <div className={`${styles.viewAll} ${styles.skeletonEdit}`}></div>
        </div>
        <div className={styles.scrollContainer}>
          <div className={styles.concertList}>
            <SkeletonConcertCard />
            <SkeletonConcertCard />
            <SkeletonConcertCard />
            <SkeletonConcertCard />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <IconBox name='calendar' size={24} color='#4986e8' />
          <h2 className={styles.title}>예정된 콘서트</h2>
        </div>
        <div className={styles.viewAll} onClick={handleEditConcert}>
          {isEditing ? '완료' : '편집'}
        </div>
      </div>

      {concerts.length > 0 ? (
        <div className={styles.scrollContainer}>
          <div className={styles.concertList}>
            {concerts.map((concert) => (
              <div key={concert.concertId} className={styles.concertCard}>
                {isEditing && (
                  <div
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConcert(concert.concertId);
                    }}
                  >
                    X
                  </div>
                )}
                <ConcertCard
                  title={concert.concertName}
                  dateRange={`${concert.arenaName}`}
                  posterUrl={concert.photoUrl}
                  onClick={() => {}}
                  width={140}
                />
              </div>
            ))}
            <Link href='/concerts/all' className={styles.addConcertItem}>
              <div className={styles.addConcertContainer}>
                <IconBox name='add' size={30} color='#666' />
              </div>
              <p className={styles.addText}></p>
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>예정된 콘서트가 없습니다</p>
          <Link href='/concerts/all' className={styles.addButton}>
            콘서트 찾아보기
          </Link>
        </div>
      )}
    </section>
  );
}
