// SearchBar.stories.tsx
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import SearchBar from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Components/Common/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    initialValue: { control: 'text' },
    onSearch: { action: 'searched' },
    fullWidth: { control: 'boolean' },
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
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  args: {
    placeholder: '아티스트명 검색',
    initialValue: '',
    fullWidth: false,
  },
};

export const WithValue: Story = {
  args: {
    placeholder: '아티스트명 검색',
    initialValue: 'NCT',
    fullWidth: false,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: '공연장 이름을 입력해주세요.',
    initialValue: '',
    fullWidth: false,
  },
};

export const UsageExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ marginBottom: '10px' }}>기본 검색바</h3>
        <SearchBar placeholder='아티스트명 검색' />
      </div>
      <div>
        <h3 style={{ marginBottom: '10px' }}>전체 너비 검색바</h3>
        <SearchBar placeholder='공연장 검색' fullWidth />
      </div>
      <div>
        <h3 style={{ marginBottom: '10px' }}>초기값이 있는 검색바</h3>
        <SearchBar placeholder='검색어 입력' initialValue='SHINee' />
      </div>
    </div>
  ),
};
