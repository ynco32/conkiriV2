import React, { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './ArtistCard.module.scss';
import IconBox from '../IconBox/IconBox';

interface ArtistCardProps {
  /**
   * 아티스트 이름
   */
  name: string;

  /**
   * 아티스트 이미지 URL (없을 경우 기본 이미지 사용)
   */
  imageUrl?: string;

  /**
   * 선택 여부
   */
  selected?: boolean;

  /**
   * 클릭 이벤트 핸들러
   */
  onClick?: () => void;

  /**
   * 추가 클래스명
   */
  className?: string;

  /**
   * 카드 크기 (px 단위의 숫자 또는 문자열)
   */
  size?: number | string;

  /**
   * 이미지 크기 (px 단위의 숫자 또는 문자열)
   */
  imageSize?: number | string;

  /**
   * 추가 스타일
   */
  style?: CSSProperties;
}

/**
 * 아티스트 정보를 표시하는 카드 컴포넌트
 */
export default function ArtistCard({
  name,
  imageUrl,
  selected = false,
  onClick,
  className = '',
  size,
  imageSize,
  style,
}: ArtistCardProps) {
  // 기본 이미지 URL
  const defaultImageUrl = '/images/dummyArtist.jpg';

  // 카드 크기 설정
  const cardWidth = size
    ? typeof size === 'number'
      ? `${size}px`
      : size
    : undefined;

  // 이미지 크기 설정
  const imgSize = imageSize
    ? typeof imageSize === 'number'
      ? `${imageSize}px`
      : imageSize
    : cardWidth
    ? `calc(${cardWidth} * 0.667)` // 카드 크기의 2/3 정도로 기본 설정
    : '80px'; // 기본값

  return (
    <div
      className={`${styles.card} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        ...style,
        width: cardWidth,
      }}
    >
      <div className={styles.imageWrapper}>
        <div
          className={`${styles.imageContainer} ${
            selected ? styles.selected : ''
          }`}
          style={{
            width: imgSize,
            height: imgSize,
          }}
        >
          <Image
            src={imageUrl || defaultImageUrl}
            alt={`${name} 프로필 이미지`}
            className={styles.image}
            fill
            sizes={`(max-width: 768px) 100vw, ${imgSize}`}
          />
        </div>
        {selected && (
          <div className={styles.checkmark}>
            <IconBox name='check-mark' color='white' size={15} />
          </div>
        )}
      </div>
      <p className={styles.name}>{name}</p>
    </div>
  );
}
