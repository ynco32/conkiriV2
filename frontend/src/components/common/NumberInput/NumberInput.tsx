import React from 'react';
import styles from './NumberInput.module.scss';

interface NumberInputProps {
  value?: string | number;
  onChange?: (value: string) => void;
  label?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  label,
}) => {
  return (
    <div className={styles.numberInputContainer}>
      <input
        type='number'
        value={value?.toString() || ''}
        onChange={(e) => {
          const newValue = e.target.value;
          if (newValue === '' || parseInt(newValue) >= 0) {
            onChange?.(newValue);
          }
        }}
        placeholder=''
        min={0}
        className={styles.numberInput}
      />
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default NumberInput;
