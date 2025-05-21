import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import TextTitle from './TextTitle';

const meta: Meta<typeof TextTitle> = {
  title: 'Components/Common/TextTitle',
  component: TextTitle,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    help: { control: 'text' },
    size: {
      control: 'select',
      options: ['large', 'medium', 'small'],
    },
    centered: { control: 'boolean' },
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
type Story = StoryObj<typeof TextTitle>;

export const Default: Story = {
  args: {
    title: '좋아하는 아티스트를 알려주세요!',
    description: '공연 정보, 티켓팅 오픈 알림을 받아볼 수 있어요.',
    size: 'medium',
    centered: false,
  },
};

export const Large: Story = {
  args: {
    title: '좋아하는 아티스트를 알려주세요!',
    description: '공연 정보, 티켓팅 오픈 알림을 받아볼 수 있어요.',
    size: 'large',
    centered: false,
  },
};

export const Small: Story = {
  args: {
    title: '좋아하는 아티스트를 알려주세요!',
    description: '공연 정보, 티켓팅 오픈 알림을 받아볼 수 있어요.',
    size: 'small',
    centered: false,
  },
};

export const Centered: Story = {
  args: {
    title: '좋아하는 아티스트를 알려주세요!',
    description: '공연 정보, 티켓팅 오픈 알림을 받아볼 수 있어요.',
    size: 'medium',
    centered: true,
  },
};

export const WithoutDescription: Story = {
  args: {
    title: '좋아하는 아티스트를 알려주세요!',
    size: 'medium',
    centered: false,
  },
};

export const WithHelp: Story = {
  args: {
    title: '좋아하는 아티스트를 알려주세요!',
    description: '공연 정보, 티켓팅 오픈 알림을 받아볼 수 있어요.',
    help: '팝, 밴드, 뮈연, 무엇인가요?',
    size: 'medium',
    centered: false,
  },
};

export const CenteredWithHelp: Story = {
  args: {
    title: '좋아하는 아티스트를 알려주세요!',
    description: '공연 정보, 티켓팅 오픈 알림을 받아볼 수 있어요.',
    help: '팝, 밴드, 뮈연, 무엇인가요?',
    size: 'medium',
    centered: true,
  },
};

export const OnlyTitleWithHelp: Story = {
  args: {
    title: '좋아하는 아티스트를 알려주세요!',
    help: '팝, 밴드, 뮈연, 무엇인가요?',
    size: 'medium',
    centered: false,
  },
};

export const LargeSizeWithHelp: Story = {
  args: {
    title: '좋아하는 아티스트를 알려주세요!',
    description: '공연 정보, 티켓팅 오픈 알림을 받아볼 수 있어요.',
    help: '팝, 밴드, 뮈연, 무엇인가요?',
    size: 'large',
    centered: false,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <TextTitle
        title='Large size with help'
        description='Description text for large size'
        help='팝, 밴드, 뮈연, 무엇인가요?'
        size='large'
      />
      <TextTitle
        title='Medium size with help'
        description='Description text for medium size'
        help='팝, 밴드, 뮈연, 무엇인가요?'
        size='medium'
      />
      <TextTitle
        title='Small size with help'
        description='Description text for small size'
        help='팝, 밴드, 뮈연, 무엇인가요?'
        size='small'
      />
    </div>
  ),
};
