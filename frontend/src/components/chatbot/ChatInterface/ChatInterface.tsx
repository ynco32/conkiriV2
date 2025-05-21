'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ChatInterface.module.scss';
import ChatInput from '@/components/common/ChatInput/ChatInput';
import { getChatbotResponse } from '@/api/chatbot/chatbot';
import Image from 'next/image';
import { getMyConcerts } from '@/api/mypage/mypage';
import { ConcertInfo } from '@/types/mypage';
import CardButton from '@/components/common/CardButton/CardButton';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  hasEvidanceImage?: boolean;
  evidenceImageData?: string;
}

// 추천 질문 아이템 인터페이스
interface RecommendedQuestion {
  id: number;
  question: string;
  icon: string; // 아이콘 경로 또는 이름
  query: string;
}

// 인터페이스 확장 - 부모 컴포넌트와 정보를 주고받기 위한 props 추가
interface ChatInterfaceProps {
  onSelectConcert?: (concertId: number, concertName: string) => void;
  onStartNewChat?: () => void;
  selectedConcertName?: string;
  resetChat?: boolean; // 채팅 초기화 트리거 추가
  onLoadingStateChange?: (loading: boolean) => void; // 로딩 상태 변경 알림 추가
}

export default function ChatInterface({
  onSelectConcert,
  onStartNewChat,
  selectedConcertName: externalSelectedConcertName,
  resetChat = false, // 초기화 트리거 기본값
  onLoadingStateChange,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null); // 메시지 컨테이너 ref 추가
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [concertList, setConcertList] = useState<ConcertInfo[]>([]);
  const [selectedConcert, setSelectedConcert] = useState<number>(0);
  const [highlightWords, setHighlightWords] = useState<string[]>([
    '끼리봇',
    '콘서트',
  ]);
  const [selectedConcertName, setSelectedConcertName] = useState<string>('');
  // 모달 관련 상태 추가
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');

  // isLoading 상태가 변경될 때마다 부모에게 알림
  useEffect(() => {
    if (onLoadingStateChange) {
      onLoadingStateChange(isLoading);
    }
  }, [isLoading, onLoadingStateChange]);

  // 채팅 초기화 함수를 useCallback으로 분리
  const resetChatState = useCallback(() => {
    setMessages([]);
    setSelectedConcert(0);
    setSelectedConcertName('');

    // 스크롤 위치를 상단으로 초기화
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }

    // 초기 인사말 메시지가 보이도록 스크롤
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    }, 100);
  }, []);

  // resetChat prop이 변경될 때 채팅 초기화
  useEffect(() => {
    if (resetChat) {
      resetChatState();
    }
  }, [resetChat, resetChatState]);

  // 외부에서 전달받은 선택된 콘서트 이름 동기화
  useEffect(() => {
    if (externalSelectedConcertName !== undefined) {
      setSelectedConcertName(externalSelectedConcertName);
      // 콘서트 이름이 빈 문자열이면 선택된 콘서트 ID도 초기화
      if (externalSelectedConcertName === '') {
        setSelectedConcert(0);
      }
    }
  }, [externalSelectedConcertName]);

  // 공통 추천 질문 목록
  const commonQuestions: RecommendedQuestion[] = [
    {
      id: 1,
      question: '입장 시간',
      icon: '🚪',
      query: '입장 시간은 언제인가요?',
    },
    {
      id: 4,
      question: '예매 날짜',
      icon: '🕒',
      query: '예매 날짜는 언제인가요?',
    },
    {
      id: 5,
      question: '휠체어석 예매 날짜',
      icon: '♿',
      query: '휠체어석 예매 날짜는 언제인가요?',
    },
    {
      id: 6,
      question: '대중교통',
      icon: '🚇',
      query: '대중교통은 무엇을 이용하면 되나요?',
    },
  ];

  const fetchConcertList = async () => {
    const response = await getMyConcerts();
    setConcertList(response?.concerts || []);

    response?.concerts.forEach((concert) => {
      setHighlightWords((prev) => [...prev, concert.concertName]);
    });
  };

  // 이미지 클릭 처리 함수 추가
  const handleImageClick = (imageSrc: string) => {
    setModalImageSrc(imageSrc);
    setShowImageModal(true);
  };

  // 모달 닫기 함수 추가
  const handleCloseModal = () => {
    setShowImageModal(false);
  };

  // 텍스트 강조 처리 함수
  const highlightText = (text: string) => {
    // 줄바꿈과 강조 처리
    let htmlText = text;

    // 각 강조 단어 처리
    highlightWords.forEach((word) => {
      if (typeof word === 'string' && word.trim() !== '') {
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedWord})`, 'g');
        htmlText = htmlText.replace(regex, `<span class="highlight">$1</span>`);
      }
    });

    // 줄바꿈 처리
    htmlText = htmlText.replace(/\n/g, '<br/>');

    return <span dangerouslySetInnerHTML={{ __html: htmlText }} />;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConcertList();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 새로운 채팅 시작 함수 수정
  const handleStartNewChat = () => {
    resetChatState();

    // 부모 컴포넌트에 알림
    if (onStartNewChat) {
      onStartNewChat();
    }
  };

  const handleSendMessage = async (message: string) => {
    const newUserMessage = {
      id: messages.length + 1,
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true); // 로딩 상태 활성화

    try {
      const response = await getChatbotResponse(message, selectedConcert);

      const newBotMessage = {
        id: messages.length + 2,
        text: response?.answer || '',
        isUser: false,
        timestamp: new Date(),
        hasEvidanceImage: response?.hasEvidanceImage || false,
        evidenceImageData: response?.evidenceImageData || '',
      };

      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      setIsError(true);
      setErrorMessage('메시지를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false); // 로딩 상태 비활성화
    }
  };

  const handleConcertClick = (concertId: number, concertName: string) => () => {
    setSelectedConcert(concertId);
    setSelectedConcertName(concertName);

    // 부모 컴포넌트에 선택된 콘서트 정보 전달
    if (onSelectConcert) {
      onSelectConcert(concertId, concertName);
    }
  };

  // 추천 질문 클릭 처리 함수
  const handleQuestionClick = (question: string) => {
    // 선택된 콘서트가 있으면 콘서트 이름을 앞에 추가
    const selectedConcertInfo = concertList.find(
      (c) => c.concertId === selectedConcert
    );
    const fullQuestion =
      selectedConcert && selectedConcertInfo
        ? `${selectedConcertInfo.concertName} ${question}`
        : question;

    handleSendMessage(fullQuestion);
  };

  return (
    <div className={styles.chatInterface}>
      {/* ref 추가 */}
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
          <div className={`${styles.messageContent} ${styles.botContent}`}>
            <div className={styles.botMessageText}>
              {highlightText(
                '안녕하세요? \n전 당신의 콘서트 도우미 끼리봇입니끼리'
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
          <div className={`${styles.messageContent} ${styles.botContent}`}>
            {concertList.length > 0 && (
              <div className={styles.botMessageText}>
                {highlightText('어떤 콘서트가 궁금하십니끼리?')}
              </div>
            )}

            {/* 콘서트 목록 */}
            {concertList.length === 0 ? (
              <div className={styles.emptyConcertContainer}>
                <div className={styles.emptyConcertMessage}>
                  관람 예정인 콘서트를 등록하고 <br /> 끼리봇에게 질문해보세요!
                </div>
                
                <button
                  type="button"
                  className={styles.concertSettingButton}
                  onClick={() => window.location.href = '/mypage'}
                >
                  콘서트 설정하기
                </button>
              </div>
            ) : (
              <div className={styles.concertList}>
                {concertList.map((concert) => (
                  <div
                    key={concert.concertId}
                    className={`${styles.concertContainer} ${
                      selectedConcert === concert.concertId
                        ? styles.selectedConcert
                        : ''
                    }`}
                    onClick={handleConcertClick(
                      concert.concertId,
                      concert.concertName
                    )}
                  >
                    <div className={styles.concertPoster}>
                      <Image
                        alt={concert.concertName}
                        src={concert.photoUrl || '/images/dummy.png'}
                        width={140}
                        height={140}
                        style={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                        }}
                        className={styles.posterImage}
                      />
                    </div>
                    <div className={styles.artistName}>
                      {Array.isArray(concert.artists)
                        ? concert.artists.length > 0
                          ? concert.artists.length > 1
                            ? `${concert.artists[0].artistName} 외`
                            : concert.artists[0].artistName
                          : ''
                        : concert.artists}
                    </div>
                    <div
                      className={styles.concertTitle}
                      title={concert.concertName}
                    >
                      {concert.concertName.length > 10
                        ? `${concert.concertName.substring(0, 12)}...`
                        : concert.concertName}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 선택된 콘서트 이름 표시 */}
            {selectedConcertName && (
              <div className={styles.selectedConcertText}>
                {highlightText(
                  `${selectedConcertName} \n의 어떤 점이 궁금하신가요?`
                )}
              </div>
            )}

            {/* 추천 질문 목록 - 콘서트 리스트와 동일 레벨에 위치 */}
            {selectedConcert > 0 && (
              <div className={styles.questionRecommendations}>
                {commonQuestions.map((item) => (
                  <div
                    key={item.id}
                    className={styles.questionItem}
                    onClick={() => handleQuestionClick(item.query)}
                  >
                    <div className={styles.questionIcon}>{item.icon}</div>
                    <div className={styles.questionText}>{item.question}</div>
                    <div className={styles.questionArrow}>›</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.messageWrapper} ${
              message.isUser ? styles.userMessage : styles.botMessage
            }`}
          >
            <div
              className={`${styles.messageContent} ${
                message.isUser ? styles.userContent : styles.botContent
              }`}
            >
              {message.isUser ? message.text : highlightText(message.text)}
              {message.evidenceImageData && (
                <img
                  src={message.evidenceImageData}
                  alt='증거 이미지'
                  className={styles.evidenceImage}
                  onClick={() => handleImageClick(message.evidenceImageData!)}
                />
              )}
            </div>
          </div>
        ))}

        {/* 로딩 말풍선 */}
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
            <div className={styles.loadingMessage}>
              <div className={styles.typingDots}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputContainer}>
        {selectedConcert > 0 ? (
          <ChatInput
            onSend={handleSendMessage}
            placeholder='여기에 질문을 입력하세요.'
            buttonText='전송'
          />
        ) : (
          <div className={styles.selectConcertMessage}>
            <p>질문할 콘서트를 선택해주세요</p>
          </div>
        )}
      </div>
      {/* 이미지 모달 추가 */}
      {showImageModal && (
        <div className={styles.imageModal} onClick={handleCloseModal}>
          <img
            src={modalImageSrc}
            alt='전체 이미지'
            className={styles.modalImage}
            onClick={(e) => e.stopPropagation()} // 이미지 클릭 시 모달이 닫히지 않도록
          />
          <button className={styles.closeButton} onClick={handleCloseModal}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
