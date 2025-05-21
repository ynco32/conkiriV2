import { useState } from 'react';
import { checkNickname, postNickname } from '@/api/auth/auth';
import { ExceptionResponse } from '@/types/api';
import { useRouter } from 'next/navigation';

interface UseNicknameReturn {
  nickname: string;
  error: string;
  isChecked: boolean;
  isAvailable: boolean;
  isLoading: boolean;
  handleChange: (value: string) => void;
  handleCheck: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useNickname = (): UseNicknameReturn => {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const maxLength = 11;

  const validateNickname = (value: string): string => {
    if (value.length > 0 && value.length < 2) {
      return '닉네임은 2자 이상 11자 이하여야 해요.';
    }
    if (!/^[가-힣a-zA-Z0-9]*$/.test(value)) {
      return '닉네임에는 특수문자나 공백을 사용할 수 없어요.';
    }
    return '';
  };

  const handleChange = (value: string) => {
    setNickname(value);
    setIsChecked(false);
    setIsAvailable(false);
    setError(validateNickname(value));
  };

  const handleCheck = async () => {
    try {
      setIsLoading(true);
      const isAvailable = await checkNickname(nickname);

      if (!isAvailable) {
        setError('이미 있는 닉네임은 사용할 수 없어요.');
        setIsAvailable(false);
        setIsChecked(true);
      } else if (nickname.length < 2 || nickname.length > maxLength) {
        setError('닉네임은 2자 이상 11자 이하여야 해요.');
        setIsAvailable(false);
        setIsChecked(true);
      } else if (!/^[가-힣a-zA-Z0-9]*$/.test(nickname)) {
        setError('닉네임에는 특수문자나 공백을 사용할 수 없어요.');
        setIsAvailable(false);
        setIsChecked(true);
      } else {
        setError('');
        setIsAvailable(true);
        setIsChecked(true);
      }
    } catch (error) {
      const apiError = error as ExceptionResponse;
      if (apiError.statusCode === 401) {
        alert('로그인이 필요합니다.');
        router.replace('/onboarding');
        return;
      }

      if (apiError.statusCode === 400) {
        alert('잘못된 요청입니다.');
        setError(apiError.message);
      }
      setIsAvailable(false);
      setIsChecked(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || !isChecked) return;

    try {
      setIsLoading(true);
      await postNickname(nickname);
      router.replace('/login/artist');
    } catch (error) {
      const apiError = error as ExceptionResponse;
      if (apiError.statusCode === 401) {
        alert('로그인이 필요합니다.');
        router.replace('/onboarding');
        return;
      }

      if (apiError.statusCode === 400) {
        alert('잘못된 요청입니다.');
        setError(apiError.message);
      }
      setIsAvailable(false);
      setIsChecked(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nickname,
    error,
    isChecked,
    isAvailable,
    isLoading,
    handleChange,
    handleCheck,
    handleSubmit,
  };
};
