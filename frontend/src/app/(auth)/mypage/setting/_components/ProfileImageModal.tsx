'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../page.module.scss';
import Button from '@/components/common/Button/Button';
import { patchProfileImage } from '@/api/auth/auth';
import { useDispatch as useAppDispatch } from '@/store';
import { UserInfo } from '@/types/user';
import { setUser } from '@/store/slices/userSlice';

interface ProfileImageProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (src: string) => void;
}

export default function ProfileImageModal({
  isOpen,
  onClose,
  onSelectImage,
}: ProfileImageProps) {
  const [profileImages, setProfileImages] = useState<
    Array<{ src: string; alt: string; imageNo: number }>
  >([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 이미지 개수를 4개로 설정 (필요에 따라 조정)
    const totalImages = 4;
    const imageList = [];

    for (let i = 1; i <= totalImages; i++) {
      imageList.push({
        src: `/images/profiles/profile-${i}.png`,
        alt: `프로필 이미지 ${i}`,
        imageNo: i, // 이미지 번호 저장
      });
    }

    setProfileImages(imageList);
  }, []);

  // 모달이 열릴 때마다 선택된 이미지 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedImage(null);
    }
  }, [isOpen]);

  // 선택된 이미지의 번호를 찾는 함수
  const getSelectedImageNo = () => {
    if (!selectedImage) return null;

    const selectedImageObj = profileImages.find(
      (img) => img.src === selectedImage
    );
    return selectedImageObj ? selectedImageObj.imageNo : null;
  };

  const handleConfirm = async () => {
    if (selectedImage) {
      try {
        const profileNumber = getSelectedImageNo();
        if (profileNumber) {
          // API에 프로필 이미지 번호 전달
          const response = await patchProfileImage(profileNumber);
          console.log('프로필 이미지 변경 성공:', response);

          // 성공 시 Redux 스토어 업데이트를 위해 선택한 이미지 경로 전달
          onSelectImage(selectedImage);

          onClose();
        }
      } catch (error) {
        console.error('프로필 이미지 변경 실패:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>프로필 이미지 선택</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.imageSelectContainer}>
          {profileImages.map((image, index) => (
            <div
              key={index}
              className={`${styles.imageItem} ${
                selectedImage === image.src ? styles.selectedImage : ''
              }`}
              onClick={() => setSelectedImage(image.src)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className={styles.profileImageOption}
              />
            </div>
          ))}
        </div>
        <div className={styles.buttonContainer}>
          <Button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={!selectedImage}
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
