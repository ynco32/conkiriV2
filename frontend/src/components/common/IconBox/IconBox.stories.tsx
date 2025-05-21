import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import IconBox, { IconName } from '@/components/common/IconBox/IconBox';

// 사용 가능한 모든 아이콘 이름 배열
const iconNames: IconName[] = [
  'write',
  'chevron-right',
  'timer',
  'bank',
  'building',
  'ticket',
  'help',
  'chevron-small-down',
  'chevron-down',
  'edit',
  'calendar',
  'heart-filled',
  'heart-outline',
  'add',
  'setting',
  'bell',
  'user',
  'chevron-left',
  'close',
  'search',
  'kakao',
  'menu',
];

const meta = {
  title: 'Components/Common/IconBox',
  component: IconBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: iconNames,
    },
    size: { control: { type: 'number', min: 12, max: 96, step: 4 } },
    color: { control: 'color' },
    strokeWidth: { control: { type: 'number', min: 0.5, max: 4, step: 0.5 } },
    rotate: { control: { type: 'number', min: 0, max: 360, step: 45 } },
  },
} satisfies Meta<typeof IconBox>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 아이콘
export const Default: Story = {
  args: {
    name: 'write',
    size: 24,
  },
};

// 색상 변경
export const ColoredIcon: Story = {
  args: {
    name: 'heart-filled',
    size: 24,
    color: '#FF5252',
  },
};

// 크기 변경
export const LargeIcon: Story = {
  args: {
    name: 'help',
    size: 48,
  },
};

// 회전
export const RotatedIcon: Story = {
  args: {
    name: 'chevron-down',
    size: 24,
    rotate: 180,
  },
};

// 두께 조절 (stroke를 사용하는 아이콘에만 적용됨)
export const StrokeWidthIcon: Story = {
  args: {
    name: 'write',
    size: 24,
    strokeWidth: 1.5,
  },
};

// 아이콘 갤러리
export const IconGallery: Story = {
  args: {
    name: 'write',
    size: 24,
  },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '24px',
        maxWidth: '800px',
      }}
    >
      {iconNames.map((icon) => (
        <div
          key={icon}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px',
            border: '1px solid #eaeaea',
            borderRadius: '8px',
          }}
        >
          <IconBox name={icon} size={24} />
          <span style={{ marginTop: '8px', fontSize: '12px' }}>{icon}</span>
        </div>
      ))}
    </div>
  ),
};
