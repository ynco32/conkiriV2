import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import CardButton from './CardButton';

// 테스트용 아이콘들 가져오기
import HeartIcon from '@/assets/icons/heart-filled.svg';
import TicketIcon from '@/assets/icons/ticket.svg';
import MusicIcon from '@/assets/icons/music.svg';

const meta: Meta<typeof CardButton> = {
  title: 'Components/CardButton',
  component: CardButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    href: { control: 'text' },
    label: { control: 'text' },
    title: { control: 'text' }, // 타이틀 컨트롤 추가
    isDisabled: { control: 'boolean' },
    imgSrc: { control: 'text' },
    imgAlt: { control: 'text' },
    className: { control: 'text' },
    onClick: { action: 'clicked' },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 48, 80, 120, 160],
      description: '버튼의 크기 (문자열 또는 숫자)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CardButton>;

// 기본 카드 버튼 (아이콘 + 텍스트)
export const Default: Story = {
  args: {
    icon: HeartIcon,
    label: '좌석 선택',
    href: '/seats',
    size: 'medium',
  },
};

// 이미지가 있는 카드 버튼
export const WithImage: Story = {
  args: {
    imgSrc: '/images/dummy.png',
    imgAlt: '좌석 선택 이미지',
    size: 'medium',
  },
};

// 타이틀이 있는 카드 버튼
export const WithTitle: Story = {
  args: {
    icon: MusicIcon,
    label: '',
    title: '대기열 입장',
    size: 'medium',
  },
};

// 비활성화된 카드 버튼
export const Disabled: Story = {
  args: {
    icon: TicketIcon,
    label: '준비 중',
    isDisabled: true,
    size: 'medium',
  },
};

// 라벨 없는 카드 버튼
export const WithoutLabel: Story = {
  args: {
    icon: MusicIcon,

    size: 'medium',
  },
};

// 타이틀만 있는 카드 버튼 (라벨 없음)
export const TitleOnly: Story = {
  args: {
    icon: MusicIcon,
    title: '좌석 선택',

    size: 'medium',
  },
};

// 다양한 크기의 카드 버튼
export const SizeVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <CardButton icon={HeartIcon} label='Small' title='Small' size='small' />
      <CardButton
        icon={HeartIcon}
        label='Medium'
        title='Medium'
        size='medium'
      />
      <CardButton icon={HeartIcon} label='Large' title='Large' size='large' />
      <CardButton icon={HeartIcon} label='80px' title='80px' size={80} />
      <CardButton icon={HeartIcon} label='120px' title='120px' size={120} />
    </div>
  ),
};

// 타이틀과 라벨 조합 예시
export const TitleLabelCombinations: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <CardButton icon={MusicIcon} label='입장' title='대기열 입장' />
      <CardButton icon={MusicIcon} label='입장' title={undefined} />
      <CardButton icon={MusicIcon} title='대기열 입장' />
      <CardButton icon={MusicIcon} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '다양한 타이틀-라벨 조합을 보여줍니다: 타이틀+라벨, 라벨만, 타이틀만, 아이콘만',
      },
    },
  },
};

// 버튼 그룹 예시 업데이트
export const ButtonGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <CardButton
        icon={HeartIcon}
        label='좌석'
        title='좌석 선택'
        href='/seats'
      />
      <CardButton
        icon={TicketIcon}
        label='티켓'
        title='티켓 예매'
        href='/tickets'
      />
      <CardButton icon={MusicIcon} label='지도' title='지도 보기' href='/map' />
      <CardButton label='준비 중' title='곧 제공 예정' isDisabled={true} />
    </div>
  ),
};
