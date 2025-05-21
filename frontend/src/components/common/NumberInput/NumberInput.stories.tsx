import type { Meta, StoryObj } from '@storybook/react';
import NumberInput from './NumberInput';

const meta = {
  title: 'Components/Common/NumberInput',
  component: NumberInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text', description: '입력 필드의 값' },
    onChange: { action: 'changed', description: '값 변경 시 호출되는 함수' },
    label: { control: 'text', description: '입력 필드 옆에 표시되는 라벨' },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '0',
    label: '개',
  },
};

export const WithoutLabel: Story = {
  args: {
    value: '5',
  },
};

export const Empty: Story = {
  args: {
    label: '수량',
  },
};

export const LongLabel: Story = {
  args: {
    value: '10',
    label: '최대 구매 가능 수량',
  },
};
