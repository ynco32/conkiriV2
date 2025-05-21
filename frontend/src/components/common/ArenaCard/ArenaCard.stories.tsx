import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import ArenaCard from './ArenaCard';

const meta: Meta<typeof ArenaCard> = {
  title: 'Components/Common/ArenaCard',
  component: ArenaCard,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    englishName: { control: 'text' },
    address: { control: 'text' },
    imageUrl: { control: 'text' },
    width: { control: 'text' },
    imageSize: { control: 'text' },
    onClick: { action: 'clicked' },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '24px', maxWidth: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArenaCard>;

export const Default: Story = {
  args: {
    name: '올림픽 체조 경기장',
    englishName: 'KSPO Dome',
    address: '서울특별시 송파구 올림픽로 424',
  },
};
