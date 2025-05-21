import type { Meta, StoryObj } from '@storybook/react';
import ConcertCard from './ConcertCard';

const meta: Meta<typeof ConcertCard> = {
  title: 'Components/Common/ConcertCard',
  component: ConcertCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'text' },
    posterRatio: {
      control: 'select',
      options: ['1:1', '4:3', '16:9', '3:4'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConcertCard>;

export const Default: Story = {
  args: {
    title: 'SHINee WORLD Ⅶ [E.S.S.A.Y] (Every Stage Shines Around You)',
    dateRange: '2025. 5. 23 (금) - 2025. 5. 25 (일)',
  },
};
