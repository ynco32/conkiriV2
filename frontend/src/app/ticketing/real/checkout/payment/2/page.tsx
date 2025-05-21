'use client';

import React, { useState } from 'react';
import { StepIndicator } from '@/components/ticketing/StepIndicator/StepIndicator';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux'; // Redux 디스패치 추가
import { reset } from '@/store/slices/captchaSlice'; // captchaSlice의 reset 액션 가져오기
import styles from './page.module.scss';

import type {
  PaymentMethod,
  BankType,
  ReceiptType,
  AgreementKey,
  Agreements,
} from '@/types/payments';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  type?: 'alert' | 'confirm';
  variant?: 'primary' | 'danger';
}

interface ModalState {
  isOpen: boolean;
  title: string;
  type?: 'alert' | 'confirm';
  variant?: 'primary' | 'danger';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const dispatch = useDispatch(); // Redux 디스패치 추가
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [bank, setBank] = useState<BankType>('');
  const [receiptType, setReceiptType] = useState<ReceiptType>('income');
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
  });

  const [agreements, setAgreements] = useState<Agreements>({
    all: false,
    terms1: false,
    terms2: false,
    terms3: false,
    terms4: false,
  });

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const showModal = (title: string, options: Partial<ModalState> = {}) => {
    setModal({
      isOpen: true,
      title,
      type: 'alert',
      variant: 'primary',
      ...options,
    });
  };

  const handleAllAgreements = (checked: boolean) => {
    setAgreements({
      all: checked,
      terms1: checked,
      terms2: checked,
      terms3: checked,
      terms4: checked,
    });
  };

  const handleSingleAgreement = (key: AgreementKey, checked: boolean) => {
    const newAgreements = {
      ...agreements,
      [key]: checked,
    };

    const termKeys: AgreementKey[] = ['terms1', 'terms2', 'terms3', 'terms4'];
    const allChecked = termKeys.every((k) => newAgreements[k]);

    setAgreements({
      ...newAgreements,
      all: allChecked,
    });
  };

  const handleSubmit = () => {
    if (paymentMethod === 'deposit' && bank === '') {
      showModal('입금하실 은행을 선택해주세요.', { variant: 'danger' });
      return;
    }
    if (paymentMethod != 'deposit') {
      showModal('무통장 입금을 선택해주세요.', { variant: 'danger' });
      return;
    }
    if (paymentMethod === 'deposit' && receiptType !== 'none') {
      showModal('현금영수증 미발행을 선택해주세요.', { variant: 'danger' });
      return;
    }
    if (!agreements.all) {
      showModal('모든 약관에 동의해주세요.', { variant: 'danger' });
      return;
    }

    showModal('연습용이므로 실제 결제는 진행되지 않습니다.', {
      type: 'confirm',
      confirmText: '결제완료',
      onConfirm: () => {
        // document.cookie = 'ticketing-progress=5; path=/';
        router.push('/ticketing/real/result');
        dispatch(reset()); // Redux 액션 디스패치로 captcha 상태 초기화
      },
    });
  };

  // 기존 PaymentMethodGroup 컴포넌트 내용
  const renderPaymentMethodGroup = () => {
    const topMethods: [PaymentMethod, string][] = [
      ['credit', '신용카드'],
      ['deposit', '무통장입금'],
      ['phone', '휴대폰결제'],
    ];

    const bottomMethods: [PaymentMethod, string][] = [
      ['kakao', '카카오페이'],
      ['kakaomini', '카카오페이 미니'],
    ];

    return (
      <div className={styles.methodContainer}>
        <div className={styles.topMethodsGrid}>
          {topMethods.map(([value, label]) => (
            <label key={value} className={styles.methodLabel}>
              <div className={styles.inputWrapper}>
                <input
                  type='radio'
                  name='payment'
                  value={value}
                  checked={paymentMethod === value}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className={styles.radioInput}
                />
              </div>
              <span>{label}</span>
            </label>
          ))}
        </div>
        <div className={styles.bottomMethodsGrid}>
          {bottomMethods.map(([value, label]) => (
            <label key={value} className={styles.methodLabel}>
              <div className={styles.inputWrapper}>
                <input
                  type='radio'
                  name='payment'
                  value={value}
                  checked={paymentMethod === value}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className={styles.radioInput}
                />
              </div>
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // 기존 BankTransferForm 컴포넌트 내용
  const renderBankTransferForm = () => {
    return (
      <div className={styles.bankFormContainer}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>입금은행</label>
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value as BankType)}
            className={styles.bankSelect}
          >
            <option value=''>입금하실 은행을 선택하세요.</option>
            <option value='shinhan'>신한은행</option>
            <option value='woori'>우리은행</option>
            <option value='kb'>KB국민은행</option>
          </select>
        </div>

        <div className={styles.accountInfo}>
          <p>예금주: 멜론티켓</p>
        </div>

        <div className={styles.formGroup}>
          <p className={styles.receiptLabel}>현금영수증</p>
          <div className={styles.receiptOptions}>
            {[
              ['income', '소득공제'],
              ['expense', '지출증빙'],
              ['none', '미발행'],
            ].map(([value, label]) => (
              <label key={value} className={styles.receiptOption}>
                <input
                  type='radio'
                  name='receipt'
                  value={value}
                  checked={receiptType === value}
                  onChange={(e) =>
                    setReceiptType(e.target.value as ReceiptType)
                  }
                  className={styles.radioInput}
                />
                <span className={styles.optionLabel}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.notice}>
          * 무통장 입금의 경우, 은행에 따라 오후 11시 30분 이후로는 온라인
          입금이 제한될 수 있습니다.
        </div>
        <div className={styles.notice}>
          * ATM 기기로는 가상 계좌 입금이 불가할 수 있으므로 인터넷뱅킹, 폰뱅킹
          사용이 불가능한 경우 다른 결제 수단을 이용해 주세요!
        </div>
      </div>
    );
  };

  // 기존 AgreementSection 컴포넌트 내용
  const renderAgreementSection = () => {
    const terms: [AgreementKey, string][] = [
      [
        'terms1',
        '[필수] 예매 및 취소 수수료/취소기한을 확인하였으며 동의합니다',
      ],
      ['terms2', '[필수] 개인정보 수집/이용에 동의합니다'],
      ['terms3', '[필수] 개인정보 제3자 제공 및 주최사 제공에 동의합니다'],
      ['terms4', '[필수] 카카오 전자금융거래 이용약관'],
    ];

    return (
      <section className={styles.agreementContainer}>
        <div className={styles.agreementHeader}>
          <span className={styles.agreementTitle}>예매자 동의</span>
          <label className={styles.allAgreementLabel}>
            <input
              type='checkbox'
              checked={agreements.all}
              onChange={(e) => handleAllAgreements(e.target.checked)}
              className={styles.checkbox}
            />
            <span>전체 동의</span>
          </label>
        </div>

        <div className={styles.termsContainer}>
          {terms.map(([key, label]) => (
            <div key={key} className={styles.termItem}>
              <input
                type='checkbox'
                checked={agreements[key]}
                onChange={(e) => handleSingleAgreement(key, e.target.checked)}
                className={styles.termCheckbox}
              />
              <span className={styles.termLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Modal 컴포넌트 통합
  const renderModal = () => {
    const {
      isOpen,
      onClose,
      title,
      confirmText = '확인',
      cancelText = '취소',
      onConfirm,
      type = 'alert',
      variant = 'primary',
    } = {
      isOpen: modal.isOpen,
      onClose: closeModal,
      title: modal.title,
      confirmText: modal.confirmText,
      cancelText: modal.cancelText,
      onConfirm: modal.onConfirm,
      type: modal.type,
      variant: modal.variant,
    };

    if (!isOpen) return null;

    return (
      <div className={styles.modalOverlay}>
        <div
          className={styles.modalBackdrop}
          onClick={type === 'alert' ? onClose : undefined}
        />
        <div className={styles.modalContent}>
          <p className={styles.modalTitle}>{title}</p>

          <div
            className={type === 'confirm' ? styles.modalButtonContainer : ''}
          >
            {type === 'confirm' && (
              <button onClick={onClose} className={styles.modalCancelButton}>
                {cancelText}
              </button>
            )}
            <button
              onClick={type === 'alert' ? onClose : onConfirm}
              className={
                variant === 'primary'
                  ? styles.modalConfirmButton
                  : styles.modalDangerButton
              }
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <StepIndicator currentStep={3} />
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.sectionWrapper}>
          {/* 예매 정보 섹션 */}
          <section>
            <h2 className={styles.sectionTitle}>예매정보</h2>
            <div className={styles.formGroup}>
              <div className={styles.formGroup}>
                <span className={styles.formLabel}>이름</span>
                <input
                  type='text'
                  value='홍길동'
                  disabled
                  className={styles.formInputDisabled}
                />
              </div>
              <div className={styles.formGroup}>
                <span className={styles.formLabel}>연락처</span>
                <div className={styles.phoneGrid}>
                  <input
                    type='text'
                    value='010'
                    disabled
                    className={styles.formInputDisabled}
                  />
                  <input
                    type='text'
                    value='1234'
                    disabled
                    className={styles.formInputDisabled}
                  />
                  <input
                    type='text'
                    value='5678'
                    disabled
                    className={styles.formInputDisabled}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <span className={styles.formLabel}>E-mail</span>
                <input
                  type='text'
                  value='example@naver.com'
                  disabled
                  className={styles.formInputDisabled}
                />
              </div>
            </div>
          </section>

          {/* 결제 수단 섹션 */}
          <section>
            <h2 className={styles.sectionPaymentTitle}>결제수단</h2>
            {renderPaymentMethodGroup()}
          </section>

          {/* 무통장입금 폼 */}
          {paymentMethod === 'deposit' && renderBankTransferForm()}

          {/* 결제 금액 섹션 */}
          <section className={styles.summarySection}>
            <div className={styles.summaryTotal}>
              <span>총 결제금액</span>
              <span className={styles.summaryTotalAmount}>79,000원</span>
            </div>
            <div className={styles.summaryDetail}>
              <span>티켓금액</span>
              <span>77,000원</span>
            </div>
            <div className={styles.summaryDetail}>
              <span>예매수수료</span>
              <span>2,000원</span>
            </div>
            <div className={styles.summaryDetail}>
              <span>배송료</span>
              <span>0원</span>
            </div>
          </section>

          {/* 약관 동의 섹션 */}
          {renderAgreementSection()}
        </div>
      </div>

      {/* 결제 버튼 */}
      <div className={styles.fixedBottom}>
        <button onClick={handleSubmit} className={styles.paymentButton}>
          79,000원 결제하기
        </button>
      </div>

      {/* 모달 - 직접 포함 */}
      {renderModal()}
    </div>
  );
}
