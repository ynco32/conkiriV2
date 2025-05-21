'use client';

import { useState, useEffect } from 'react';
import Captcha from '@/components/ticketing/Captcha/Captcha';
import TicketingArea from '@/components/ticketing/TicketingArea/TicketingArea';
import styles from './page.module.scss';
import { useParams, useRouter } from 'next/navigation';
import TicketingBottomButton from '@/components/ticketing/TicketingBottomButton/TicketingBottomButton';
import { useSelector, useDispatch } from 'react-redux';
import { setCaptchaState, setPostponeState } from '@/store/slices/captchaSlice'; // 경로는 실제 구조에 맞게 수정하세요

interface RootState {
  captcha: {
    onPostpone: boolean;
    onSuccess: boolean;
  };
}

export default function Area() {
  const [isSecurityMessageOpen, setisSecurityMessageOpen] = useState(false);
  const dispatch = useDispatch();
  const onSuccess = useSelector((state: RootState) => state.captcha.onSuccess);
  const router = useRouter();

  useEffect(() => {
    if (!onSuccess) {
      // 이미 보안문자를 성공하지 않았다면
      setisSecurityMessageOpen(true);
    }
  }, []);

  const handleOnPostpone = () => {
    setisSecurityMessageOpen(false);
    dispatch(setPostponeState(true)); // 미루기 상태 저장
  };

  const handleOnSuccess = () => {
    setisSecurityMessageOpen(false);
    dispatch(setCaptchaState(true)); // 성공 상태 저장
  };

  return (
    <div>
      <Captcha
        isOpen={isSecurityMessageOpen}
        onPostpone={handleOnPostpone} // 미루기 기능 활성화 상태 저장 추가됨
        onSuccess={handleOnSuccess}
      />
      <TicketingArea />
      <TicketingBottomButton isActive={false}>다음</TicketingBottomButton>
    </div>
  );
}
