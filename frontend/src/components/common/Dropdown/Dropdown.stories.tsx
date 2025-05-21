import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Dropdown, { DropdownProps } from './Dropdown';
import SmallDropdown from './SmallDropdown';

const meta = {
  title: 'Components/Common/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// 샘플 옵션
const dateOptions = [
  { label: '2025년 05월 25일 17:00', value: '2025-05-25T17:00' },
  { label: '2025년 05월 26일 18:00', value: '2025-05-26T18:00' },
  { label: '2025년 05월 27일 19:00', value: '2025-05-27T19:00' },
  { label: '2025년 05월 28일 20:00', value: '2025-05-28T20:00' },
];

const sortOptions = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
];

// 상태를 가진 예시를 위한 템플릿
const DropdownTemplate = (args: DropdownProps) => {
  const [value, setValue] = useState<string>('');
  return <Dropdown {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: DropdownTemplate,
  args: {
    options: dateOptions,
    placeholder: '날짜/시간 선택',
  },
};

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState('section');
    return (
      <SmallDropdown
        options={sortOptions}
        value={value}
        onChange={setValue}
        placeholder='구역'
      />
    );
  },
  args: {
    // SmallDropdown에 기본 props로 전달되는 값들
    options: sortOptions,
    placeholder: '구역',
  },
};

// 두 사이즈 비교
export const Comparison: Story = {
  render: () => {
    const [dateValue, setDateValue] = useState('');
    const [sortValue, setSortValue] = useState('');

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '300px',
        }}
      >
        <div>
          <h3 style={{ marginBottom: '8px' }}>기본 사이즈 드롭다운</h3>
          <Dropdown
            options={dateOptions}
            value={dateValue}
            onChange={setDateValue}
            placeholder='날짜/시간 선택'
          />
        </div>

        <div>
          <h3 style={{ marginBottom: '8px' }}>작은 사이즈 드롭다운</h3>
          <SmallDropdown
            options={sortOptions}
            value={sortValue}
            onChange={setSortValue}
            placeholder='구역'
          />
        </div>
      </div>
    );
  },
  args: {
    // 이 args는 render 함수 내부에서 사용되지 않지만, 스토리북 타입 검사를 위해 필요함
    options: dateOptions,
  },
};
