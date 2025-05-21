// src/components/common/ImageUpload/ImageUpload.tsx
import { useRef, useEffect, useState, ChangeEvent, MouseEvent } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './ImageUpload.module.scss';

export interface ImageUploadProps {
  // 여러 이미지를 위해 배열로 변경
  value: (File | string)[] | null;
  onChange: (files: (File | string)[] | null) => void;
  onError?: (message: string) => void;
  className?: string;
  error?: string;
  // 이미지 업로드 텍스트 커스텀 가능하도록 추가
  uploadText?: string;
  // 최대 이미지 개수 (기본값 3)
  maxImages?: number;
}

export default function ImageUpload({
  value,
  onChange,
  onError,
  className = '',
  error,
  uploadText,
  maxImages = 3,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // 프리뷰 이미지 배열로 변경
  const [previews, setPreviews] = useState<string[]>([]);
  const pathname = usePathname();

  const isSharing = pathname?.includes('sharing');
  const isSight = pathname?.includes('sight');

  // value가 변경될 때마다 previews 업데이트
  useEffect(() => {
    // 이전 URL 객체 해제
    previews.forEach((preview) => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });

    if (!value || value.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews = value
      .map((item) => {
        if (item instanceof File) {
          return URL.createObjectURL(item);
        } else if (typeof item === 'string') {
          return item;
        }
        return '';
      })
      .filter(Boolean);

    setPreviews(newPreviews);

    // 컴포넌트 언마운트 시 Blob URL 해제
    return () => {
      newPreviews.forEach((preview) => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [value]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    // 5MB = 5 * 1024 * 1024 bytes
    const maxSize = 5 * 1024 * 1024;
    const currentFiles = value || [];

    // 새 파일을 추가해도 최대 이미지 개수를 초과하지 않는지 확인
    if (currentFiles.length + files.length > maxImages) {
      onError?.(`최대 ${maxImages}장까지만 업로드할 수 있습니다.`);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    // 파일 크기 검증
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize) {
        onError?.('파일 크기는 5MB를 초과할 수 없습니다.');
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }
    }

    // 기존 파일에 새 파일 추가
    const newFiles = [...currentFiles];
    for (let i = 0; i < files.length; i++) {
      newFiles.push(files[i]);
    }

    onChange(newFiles);

    // 파일 선택 후 input 초기화
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (index: number, e: MouseEvent) => {
    e.stopPropagation();

    if (!value) return;

    const newFiles = [...value];
    newFiles.splice(index, 1);

    if (newFiles.length === 0) {
      onChange(null);
    } else {
      onChange(newFiles);
    }
  };

  const renderUploadText = () => {
    // 커스텀 텍스트가 있으면 해당 텍스트 사용
    if (uploadText) {
      return (
        <span className={error ? styles.errorText : styles.guideText}>
          {uploadText}
        </span>
      );
    }

    const textClassName = error ? styles.errorText : styles.guideText;

    return (
      <>
        <span className={textClassName}>이미지를 업로드 해주세요</span>
        <span className={textClassName}>(최대 {maxImages}장)</span>
      </>
    );
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <input
        type='file'
        ref={inputRef}
        className={styles.hiddenInput}
        accept='image/*'
        onChange={handleImageChange}
        multiple
      />
      <div className={styles.wrapper}>
        <div className={styles.imagesGrid}>
          {/* 이미지 프리뷰 렌더링 */}
          {previews.map((preview, index) => (
            <div key={`${preview}-${index}`} className={styles.previewItem}>
              <div className={styles.previewContainer}>
                <Image
                  src={preview}
                  alt={`업로드된 이미지 ${index + 1}`}
                  fill
                  className={styles.previewImage}
                  sizes='(max-width: 128px) 100vw, 128px'
                  priority={false}
                />
                <button
                  type='button'
                  onClick={(e) => handleRemove(index, e)}
                  className={styles.removeButton}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className={styles.xIcon}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M6 18 18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* 최대 이미지 개수에 도달하지 않았으면 업로드 버튼 표시 */}
          {(!value || value.length < maxImages) && (
            <div
              className={`${styles.uploadContainer} ${
                error ? styles.errorBorder : ''
              }`}
              onClick={handleClick}
            >
              <div className={styles.uploadPlaceholder}>
                {renderUploadText()}
                <div className={styles.plusButtonContainer}>
                  <div className={styles.plusButton}>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      className={styles.plusIcon}
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4v16m8-8H4'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
}
