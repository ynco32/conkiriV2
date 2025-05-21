import { SelectButton } from './SelectButton';
import styles from './ReviewSelect.module.scss';

// 옵션 타입 정의
interface SelectOption<T> {
  label: string; // 화면에 표시될 한국어 값
  value: T; // 백엔드로 전송될 값 (예: 영어 enum)
  color?: string; // 원의 색상 (선택적)
}

interface ReviewSelectProps<T> {
  options: SelectOption<T>[]; // 옵션 객체 배열
  value?: T; // 현재 선택된 값 (value 기준)
  onChange?: (value: T) => void; // 값 변경 콜백
  className?: string; // 추가 클래스명
}

export const ReviewSelect = <T extends string>({
  options,
  value,
  onChange,
  className = '',
}: ReviewSelectProps<T>) => {
  return (
    <div className={`${styles.reviewSelectContainer} ${className}`}>
      {options.map((option) => (
        <SelectButton
          key={String(option.value)}
          label={option.label}
          selected={option.value === value}
          onClick={() => onChange?.(option.value)}
          circleColor={option.color}
        />
      ))}
    </div>
  );
};
