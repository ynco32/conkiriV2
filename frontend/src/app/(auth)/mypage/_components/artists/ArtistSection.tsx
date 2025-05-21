'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import IconBox from '@/components/common/IconBox/IconBox';
import { ArtistInfo } from '@/types/mypage';
import styles from './ArtistSection.module.scss';
import { deleteArtist, getMyArtists } from '@/api/mypage/mypage';

interface ArtistSectionProps {
  onCountChange: (count: number) => void;
}

// 스켈레톤 아티스트 아이템 컴포넌트
const SkeletonArtistItem = () => {
  return (
    <div className={styles.artistItem}>
      <div className={`${styles.artistImageContainer} ${styles.skeleton}`}>
        <div className={styles.skeletonCircle}></div>
      </div>
      <div className={`${styles.skeletonName}`}></div>
    </div>
  );
};

export default function ArtistSection({ onCountChange }: ArtistSectionProps) {
  const [artists, setArtists] = useState<ArtistInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditArtist = () => {
    setIsEditing(!isEditing);
  };

  const handleDeleteArtist = async (artistId: number) => {
    try {
      // 낙관적 업데이트: 서버 응답을 기다리지 않고 UI를 먼저 업데이트
      const updatedArtists = artists.filter(
        (artist) => artist.artistId !== artistId
      );
      setArtists(updatedArtists);
      onCountChange(updatedArtists.length);

      // 서버에 삭제 요청
      await deleteArtist(artistId);
    } catch (error) {
      // 실패 시 원래 상태로 복구
      const response = await getMyArtists();
      const artistsData = response?.artists || [];
      setArtists(artistsData);
      onCountChange(artistsData.length);
      console.error('아티스트 삭제 실패:', error);
    }
  };

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await getMyArtists();
        const artistsData = response?.artists || [];
        setArtists(artistsData);
        onCountChange(artistsData.length);
      } catch (error) {
        console.error('아티스트 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, [onCountChange]);

  // 초기 로딩 시에만 스켈레톤 UI 표시
  if (loading && artists.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <IconBox name='heart-filled' size={24} color='#4986e8' />
            <h2 className={styles.title}>관심 아티스트</h2>
          </div>
          <div className={`${styles.editButton} ${styles.skeletonEdit}`}></div>
        </div>
        <div className={styles.scrollContainer}>
          <div className={styles.artistList}>
            <SkeletonArtistItem />
            <SkeletonArtistItem />
            <SkeletonArtistItem />
            <SkeletonArtistItem />
            <SkeletonArtistItem />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <IconBox name='heart-filled' size={24} color='#4986e8' />
          <h2 className={styles.title}>관심 아티스트</h2>
        </div>
        <div className={styles.editButton} onClick={handleEditArtist}>
          {isEditing ? '완료' : '편집'}
        </div>
      </div>
      {artists.length > 0 ? (
        <div className={styles.scrollContainer}>
          <div className={styles.artistList}>
            {artists.map((artist) => (
              <div key={artist.artistId} className={styles.artistItem}>
                {isEditing && (
                  <div
                    className={styles.deleteButton}
                    onClick={() => handleDeleteArtist(artist.artistId)}
                  >
                    X
                  </div>
                )}
                <div className={styles.artistImageContainer}>
                  <Image
                    src={artist.photoUrl || '/images/dummyArtist.jpg'}
                    alt={`${artist.artistName} 이미지`}
                    className={styles.artistImage}
                    width={70}
                    height={70}
                  />
                </div>
                <p className={styles.artistName}>{artist.artistName}</p>
              </div>
            ))}
            <Link href='/artists/all' className={styles.addArtistItem}>
              <div className={styles.addArtistContainer}>
                <IconBox name='add' size={30} color='#666' />
              </div>
              <p className={styles.addText}></p>
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>관심 아티스트가 없습니다</p>
          <Link href='/artists/all' className={styles.addButton}>
            아티스트 찾아보기
          </Link>
        </div>
      )}
    </section>
  );
}
