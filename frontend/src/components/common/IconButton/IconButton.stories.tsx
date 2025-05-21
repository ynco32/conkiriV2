import type { Meta, StoryObj } from '@storybook/react';
import IconButton from './IconButton';

const meta = {
  title: 'Components/Common/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'select',
      options: [
        'add',
        'edit',
        'close',
        'search',
        'write',
        'chevron-right',
        'timer',
        'bank',
        'building',
        'ticket',
        'help',
        'chevron-small-down',
        'chevron-down',
        'calendar',
        'heart-filled',
        'heart-outline',
        'setting',
        'bell',
        'user',
        'chevron-left',
        'kakao',
        'menu',
      ],
    },
    iconSize: {
      control: { type: 'number', min: 12, max: 32, step: 2 },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof IconButton>;

// 기본 아이콘 버튼
export const SingleIcon: Story = {
  render: (args) => <IconButton {...args} />,
  args: {
    icon: 'add',
    iconSize: 30,
  },
};

// 커스텀 스타일 예시
export const CustomStyle: Story = {
  render: (args) => <IconButton {...args} />,
  args: {
    icon: 'add',
    iconSize: 30,
    style: { backgroundColor: '#28a745' },
  },
};
