'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TicketingArea.module.scss';

const TicketingArea: React.FC = () => {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    setIsPopupOpen(true);
  };

  const handleClose = () => {
    setIsPopupOpen(false);
    setSelectedSection(null);
  };

  const handleMove = async () => {
    // document.cookie = 'ticketing-progress=2; path=/';
    if (selectedSection) {
      try {
        await router.push(`/ticketing/real/areas/${selectedSection}`);
      } catch (error) {
        console.error('라우팅 에러:', error);
        window.location.href = `/ticketing/real/areas/${selectedSection}`;
      }
    }
    setIsPopupOpen(false);
  };

  return (
    <div className={styles.container}>
      <svg viewBox='0 0 205 209' className={styles.areaMap}>
        {/* Stage */}
        <path
          d='M159.294 32H47.0257C45.9832 32 45.1379 32.8466 45.1379 33.8907V53.2601C45.1379 54.3042 45.9832 55.1508 47.0257 55.1508H96.2878C97.2739 55.1508 98.0685 55.9522 98.0685 56.9342V76.7946C98.0685 77.7823 97.2683 78.5781 96.2878 78.5781H83.2594C82.3465 78.5781 81.6027 79.323 81.6027 80.2373V112.187C81.6027 113.101 82.3465 113.846 83.2594 113.846H123.066C123.979 113.846 124.723 113.101 124.723 112.187V80.2373C124.723 79.323 123.979 78.5781 123.066 78.5781H110.037C109.051 78.5781 108.257 77.7766 108.257 76.7946V56.9342C108.257 55.9465 109.057 55.1508 110.037 55.1508H159.3C160.342 55.1508 161.187 54.3042 161.187 53.2601V33.8907C161.187 32.8466 160.342 32 159.3 32H159.294Z'
          fill='#DADADA'
        />
        <text
          x='103'
          y='48'
          textAnchor='middle'
          fill='white'
          style={{ fontSize: '14px' }}
        >
          STAGE
        </text>

        {/* A Section Left */}
        <g
          onClick={() => handleSectionClick('A')}
          className={styles.sectionArea}
        >
          <path
            d='M41.8528 101.142C52.2608 101.04 62.6745 101.018 73.0826 101.142C75.4099 101.17 75.8945 100.352 75.8663 98.224C75.7705 90.6162 75.8945 83.0028 75.8156 75.3949C75.793 73.4704 76.3228 72.7706 78.3401 72.7875C82.4707 72.827 86.2349 72.8778 90.4387 72.8722C92.5744 72.8722 93.3577 72.3925 93.3013 70.3381C93.245 68.4249 93.3013 65.5861 93.1773 63.5995C93.0252 61.1839 93.3013 60.3261 90.1118 60.3769C82.6679 60.5067 55.2925 60.2301 47.8204 60.3486C45.1493 60.3882 44.552 61.1557 44.5633 63.6841C44.5745 67.3921 44.8958 71.1903 43.2897 74.8136C39.9594 82.3311 38.6464 90.2042 39.0803 98.4215C39.1874 100.47 39.7453 101.159 41.8528 101.142Z'
            className={`${styles.sectionPath} ${
              selectedSection === 'A' ? styles.selectedA : styles.sectionA
            }`}
          />
          <text
            x='58'
            y='83'
            textAnchor='middle'
            fill='white'
            style={{ fontSize: '14px' }}
          >
            A
          </text>
        </g>

        {/* A Section Bottom */}
        <g
          onClick={() => handleSectionClick('A')}
          className={styles.sectionArea}
        >
          <path
            d='M73.9335 104.471C63.1366 104.533 52.3454 104.516 41.5485 104.471C39.9651 104.466 39.5763 105.171 39.8298 106.56C43.4927 126.9 53.9852 141.822 73.6687 149.526C75.5733 150.271 75.8945 149.746 75.8776 147.94C75.81 141.077 75.8494 134.214 75.8494 127.346H75.8889C75.8889 120.573 75.8776 113.806 75.8945 107.034C75.8945 105.645 75.9734 104.449 73.9391 104.46L73.9335 104.471Z'
            className={`${styles.sectionPath} ${
              selectedSection === 'A' ? styles.selectedA : styles.sectionA
            }`}
          />
        </g>

        {/* B Section Right */}
        <g
          onClick={() => handleSectionClick('B')}
          className={styles.sectionArea}
        >
          <path
            d='M164.467 101.142C154.059 101.04 143.645 101.018 133.237 101.142C130.91 101.17 130.425 100.352 130.453 98.224C130.549 90.6162 130.425 83.0028 130.504 75.3949C130.527 73.4704 129.997 72.7706 127.98 72.7875C123.849 72.827 120.085 72.8778 115.881 72.8722C113.745 72.8722 112.962 72.3925 113.018 70.3381C113.075 68.4249 113.018 65.5861 113.142 63.5995C113.295 61.1839 113.018 60.3261 116.208 60.3769C123.652 60.5067 151.027 60.2301 158.499 60.3486C161.17 60.3882 161.768 61.1557 161.756 63.6841C161.745 67.3921 161.424 71.1903 163.03 74.8136C166.36 82.3311 167.673 90.2042 167.239 98.4215C167.132 100.47 166.575 101.159 164.467 101.142Z'
            className={`${styles.sectionPath} ${
              selectedSection === 'B' ? styles.selectedB : styles.sectionB
            }`}
          />
          <text
            x='148'
            y='83'
            textAnchor='middle'
            fill='white'
            style={{ fontSize: '14px' }}
          >
            B
          </text>
        </g>

        {/* B Section Bottom */}
        <g
          onClick={() => handleSectionClick('B')}
          className={styles.sectionArea}
        >
          <path
            d='M132.386 104.471C143.183 104.533 153.975 104.516 164.771 104.471C166.355 104.466 166.744 105.171 166.49 106.56C162.827 126.9 152.335 141.822 132.651 149.526C130.747 150.271 130.425 149.746 130.442 147.94C130.51 141.077 130.471 134.214 130.471 127.346H130.431C130.431 120.573 130.442 113.806 130.425 107.034C130.425 105.645 130.347 104.449 132.381 104.46L132.386 104.471Z'
            className={`${styles.sectionPath} ${
              selectedSection === 'B' ? styles.selectedB : styles.sectionB
            }`}
          />
        </g>

        {/* C Section */}
        <g
          onClick={() => handleSectionClick('C')}
          className={styles.sectionArea}
        >
          <path
            d='M124.897 121.849C124.801 130.868 124.79 139.892 124.88 148.911C124.897 150.835 124.244 151.767 122.474 152.421C109.339 157.269 96.2991 157.382 83.2877 151.942C81.9634 151.389 81.4112 150.706 81.4168 149.25C81.4788 140.135 81.507 131.02 81.4506 121.9C81.4393 119.941 82.1043 119.259 84.0653 119.287C90.4442 119.377 96.8232 119.321 103.202 119.321V119.309C109.581 119.309 115.96 119.371 122.339 119.27C124.317 119.236 124.914 119.879 124.892 121.849H124.897Z'
            className={`${styles.sectionPath} ${
              selectedSection === 'C' ? styles.selectedC : styles.sectionC
            }`}
          />
          <text
            x='103'
            y='133'
            textAnchor='middle'
            fill='white'
            style={{ fontSize: '14px' }}
          >
            C
          </text>
        </g>
        {/* Floor */}
        <path
          d='M84.3415 175.668C84.3866 172.288 84.3866 168.907 84.3415 165.532C84.3133 163.433 85.1586 162.479 87.3675 162.524C92.6138 162.62 97.8658 162.552 103.112 162.558C108.268 162.558 113.424 162.643 118.575 162.518C120.958 162.462 122.046 163.269 121.973 165.735C121.877 169.02 121.911 172.305 121.961 175.589C121.995 177.796 121.06 178.908 118.795 178.902C108.392 178.885 97.9897 178.88 87.5873 178.902C85.3671 178.902 84.3133 177.926 84.3415 175.668Z'
          fill='#B0B0B0'
        />
        <text
          x='103'
          y='171'
          textAnchor='middle'
          dominantBaseline='middle'
          fill='white'
          style={{ fontSize: '8px' }}
        >
          FLOOR
        </text>
      </svg>

      {isPopupOpen && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <div className={styles.popupTitle}>선택 구역</div>
            <div className={styles.selectedBox}>
              {selectedSection ? `${selectedSection}구역` : ''}
            </div>
            <div className={styles.popupDescription}>
              상세 구역 잔여좌석 현황이 <br /> 제공되지 않는 상품입니다.
            </div>
            <div className={styles.buttonContainer}>
              <button onClick={handleClose} className={styles.popupButton}>
                닫기
              </button>
              <button onClick={handleMove} className={styles.popupButton}>
                이동
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketingArea;
