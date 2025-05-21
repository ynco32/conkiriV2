'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from '../page.module.scss';
import Write from '@/assets/icons/write.svg';
import Camera from '@/assets/icons/camera.svg';
import ProfileImageModal from './ProfileImageModal';
import { useSelector } from 'react-redux';
import { UserInfo } from '@/types/user';
import { RootState, useDispatch as useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/userSlice';
import { checkNickname, patchNickname, postNickname } from '@/api/auth/auth';

export default function ProfileSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSuccess, setNicknameSuccess] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editContainerRef = useRef<HTMLDivElement>(null);

  // Redux에서 사용자 정보 가져오기
  const dispatch = useAppDispatch();
  const userData = useSelector((state: RootState) => state.user.data);

  // 프로필 이미지 경로 생성
  const profileImage = userData?.profileNumber
    ? `/images/profiles/profile-${userData.profileNumber}.png`
    : '/svgs/main/profile.svg';

  // 닉네임 편집 모드 시작시 현재 닉네임으로 초기화
  useEffect(() => {
    if (isEditingNickname && userData?.nickname) {
      setNickname(userData.nickname);
      // 포커스 설정
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isEditingNickname, userData?.nickname]);

  // 외부 클릭 감지를 위한 useEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditingNickname &&
        editContainerRef.current &&
        !editContainerRef.current.contains(event.target as Node)
      ) {
        handleCancelEdit();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingNickname]);

  const handleImageSelect = (src: string) => {
    // 이미지 경로에서 프로필 번호 추출
    const match = src.match(/profile-(\d+)\.png$/);
    const profileNumber = match ? parseInt(match[1]) : undefined;

    if (profileNumber && userData) {
      // 기존 사용자 데이터를 유지하면서 프로필 번호만 업데이트
      const updatedUserData = {
        ...userData,
        profileNumber,
      };

      // 사용자 정보 업데이트 액션 디스패치
      dispatch(setUser(updatedUserData));
    }
  };

  // 닉네임 유효성 검사
  const validateNickname = (value: string): string => {
    if (value.length > 0 && value.length < 2) {
      return '닉네임은 2자 이상 11자 이하여야 해요.';
    }
    if (!/^[가-힣a-zA-Z0-9]*$/.test(value)) {
      return '닉네임에는 특수문자나 공백을 사용할 수 없어요.';
    }
    return '';
  };

  // 닉네임 변경 핸들러
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 11) {
      // 최대 길이 제한
      setNickname(value);
      setIsChecked(false);
      setIsAvailable(false);
      setNicknameError(validateNickname(value));
      setNicknameSuccess(''); // 성공 메시지 초기화
    }
  };

  // 닉네임 중복 확인
  const handleNicknameCheck = async () => {
    try {
      setIsLoading(true);
      setNicknameSuccess(''); // 성공 메시지 초기화

      // 기본 유효성 검사
      const validationError = validateNickname(nickname);
      if (validationError) {
        setNicknameError(validationError);
        setIsAvailable(false);
        setIsChecked(true);
        return;
      }

      const isAvailable = await checkNickname(nickname);

      if (!isAvailable) {
        setNicknameError('이미 있는 닉네임은 사용할 수 없어요.');
        setIsAvailable(false);
        setNicknameSuccess('');
      } else {
        setNicknameError('');
        setIsAvailable(true);
        setNicknameSuccess('사용할 수 있는 닉네임이에요!');
      }
      setIsChecked(true);
    } catch (error) {
      console.error('닉네임 중복 확인 실패:', error);
      setNicknameError('닉네임 중복 확인에 실패했습니다.');
      setNicknameSuccess('');
      setIsAvailable(false);
      setIsChecked(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 닉네임 업데이트 확인
  const handleNicknameUpdate = async () => {
    if (!isAvailable || !isChecked || !userData) return;

    try {
      setIsLoading(true);

      // API 응답 상태 확인을 위한 변수
      let apiCallSuccessful = false;

      try {
        // API를 통해 서버에 닉네임 업데이트 요청
        const response = await patchNickname(nickname);
        // 응답이 성공적인 경우에만 플래그 설정
        apiCallSuccessful = true;
      } catch (apiError) {
        console.error('API 호출 오류:', apiError);
        throw new Error('닉네임 업데이트 API 호출에 실패했습니다.');
      }

      // API 호출이 확실하게 성공한 경우에만 스토어 업데이트
      if (apiCallSuccessful) {
        // 기존 사용자 데이터를 유지하면서 닉네임만 업데이트
        const updatedUserData = {
          ...userData,
          nickname,
        };

        // 사용자 정보 업데이트 액션 디스패치
        dispatch(setUser(updatedUserData));

        // 편집 모드 종료
        setIsEditingNickname(false);
        setIsChecked(false);
        setIsAvailable(false);
        setNicknameSuccess('');
        setNicknameError('');
      } else {
        // API 호출이 성공적이지 않은 경우
        throw new Error('닉네임 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('닉네임 업데이트 처리 중 오류:', error);
      setNicknameError('닉네임 업데이트에 실패했습니다. 다시 시도해주세요.');
      // 오류 발생 시 스토어를 업데이트하지 않고 편집 모드 유지
    } finally {
      setIsLoading(false);
    }
  };

  // 닉네임 편집 종료
  const handleCancelEdit = () => {
    setIsEditingNickname(false);
    setNicknameError('');
    setNicknameSuccess('');
    setIsChecked(false);
    setIsAvailable(false);
  };

  return (
    <div className={styles.profileSection}>
      <div className={styles.profileImageContainer}>
        <div className={styles.profileImageWrapper}>
          <Image src={profileImage} alt='프로필 이미지' fill />
        </div>
        <div
          className={styles.cameraIconWrapper}
          onClick={() => setModalOpen(true)}
        >
          <Camera className={styles.cameraIcon} />
        </div>
      </div>

      <div className={styles.profileName}>
        {isEditingNickname ? (
          <div ref={editContainerRef} className={styles.nicknameEditContainer}>
            <input
              ref={inputRef}
              type='text'
              value={nickname}
              onChange={handleNicknameChange}
              className={`${styles.nicknameInput} ${
                nicknameError ? styles.inputError : ''
              }`}
              maxLength={11}
              placeholder='2-11자 입력'
            />
            <button
              className={styles.nicknameButton}
              onClick={
                isChecked && isAvailable
                  ? handleNicknameUpdate
                  : handleNicknameCheck
              }
              disabled={isLoading || !nickname || !!nicknameError}
            >
              {isChecked && isAvailable ? '확인' : '중복확인'}
            </button>
            {nicknameError && (
              <div className={styles.errorMessage}>{nicknameError}</div>
            )}
            {nicknameSuccess && (
              <div className={styles.successMessage}>{nicknameSuccess}</div>
            )}
          </div>
        ) : (
          <>
            <div>{userData?.nickname || '사용자'}</div>
            <Write
              className={styles.writeIcon}
              onClick={() => setIsEditingNickname(true)}
            />
          </>
        )}
      </div>

      <ProfileImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectImage={handleImageSelect}
      />
    </div>
  );
}
