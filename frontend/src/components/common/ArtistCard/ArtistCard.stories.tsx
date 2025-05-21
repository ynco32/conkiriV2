import { Meta, StoryObj } from '@storybook/react';
import ArtistCard from './ArtistCard';

const meta: Meta<typeof ArtistCard> = {
  title: 'Components/Common/ArtistCard',
  component: ArtistCard,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    imageUrl: { control: 'text' },
    selected: { control: 'boolean' },
    size: { control: 'number' },
    imageSize: { control: 'number' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ArtistCard>;

export const Default: Story = {
  args: {
    name: 'SHINee',
    selected: false,
  },
};

export const Selected: Story = {
  args: {
    ...Default.args,
    selected: true,
  },
};