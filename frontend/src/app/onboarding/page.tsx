'use client';

import LoginButton from '@/components/auth/LoginButton/LoginButton';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import styles from './page.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Swiper 스타일 import
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function OnboardingPage() {
  const router = useRouter();

  const handleClose = () => {
    router.replace('/main');
  };

  return (
    <div className={styles.onboardingPage}>
      <button className={styles.closeButton} onClick={handleClose}>
        ✕
      </button>
      <Swiper
        className={styles.swiper}
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
      >
        <SwiperSlide className={styles.swiperSlide}>
          <div className={styles.imageContainer}>
            <Image
              src='/images/onboarding1.png'
              alt='dummyArtist'
              width={430}
              height={640}
              className={styles.slideImage}
            />
          </div>
        </SwiperSlide>
        <SwiperSlide className={styles.swiperSlide}>
          <div className={styles.imageContainer}>
            <Image
              src='/images/onboarding2.png'
              alt='dummyConcert'
              width={430}
              height={640}
              className={styles.slideImage}
            />
          </div>
        </SwiperSlide>
        <SwiperSlide className={styles.swiperSlide}>
          <div className={styles.imageContainer}>
            <Image
              src='/images/onboarding3.png'
              alt='dummyArtist'
              width={430}
              height={640}
              className={styles.slideImage}
            />
          </div>
        </SwiperSlide>
        <SwiperSlide className={styles.swiperSlide}>
          <div className={styles.imageContainer}>
            <Image
              src='/images/onboarding4.png'
              alt='dummyConcert'
              width={430}
              height={640}
              className={styles.slideImage}
            />
          </div>
        </SwiperSlide>
      </Swiper>

      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <div>간편하게 로그인하고</div>
          <div>다양한 서비스를 즐겨보세요</div>
        </div>
        <div className={styles.buttonContainer}>
          <LoginButton isLogin={true} />
        </div>
      </div>
    </div>
  );
}
