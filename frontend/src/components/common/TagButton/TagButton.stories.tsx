import type { Meta, StoryObj } from '@storybook/react';
import TagButton from './TagButton';

const meta = {
  title: 'Components/Common/TagButton',
  component: TagButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['active', 'default', 'disabled'],
    },
    iconName: {
      control: 'select',
      options: [undefined, 'check-box'],
    },
    iconSize: {
      control: { type: 'number', min: 10, max: 24, step: 1 },
    },
    iconColor: {
      control: 'color',
    },
  },
} satisfies Meta<typeof TagButton>;

export default meta;
type Story = StoryObj<typeof TagButton>;

export const Default: Story = {
  render: (args) => <TagButton {...args} />,
  args: {
    children: '초기화',
    type: 'default',
  },
};

export const Active: Story = {
  render: (args) => <TagButton {...args} />,
  args: {
    children: '전체 좌석 리뷰 보기',
    type: 'active',
    iconName: 'check-box',
  },
};

export const Disabled: Story = {
  render: (args) => <TagButton {...args} />,
  args: {
    children: '초기화',
    type: 'disabled',
  },
};

export const TagGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <TagButton type='active' iconName='check-box'>
          전체 좌석 리뷰 보기
        </TagButton>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <TagButton type='default'>초기화</TagButton>
        <TagButton type='disabled'>초기화</TagButton>
      </div>
    </div>
  ),
  args: {
    // 이 args는 render 함수 내부에서 직접 사용되지 않지만, 스토리북 타입 검사를 위해 필요합니다
    children: '태그 그룹',
    type: 'default',
  },
};
