import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Button from './Button';
import IconBox from '../IconBox/IconBox';

const meta = {
  title: 'Components/Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'outline'],
    },
    width: {
      control: 'text',
    },
    height: {
      control: 'text',
    },
    padding: {
      control: 'text',
    },
    fontSize: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: '다음',
    variant: 'primary',
  },
};

export const Outline: Story = {
  args: {
    children: '다음',
    variant: 'outline',
  },
};

export const CustomDimensions: Story = {
  args: {
    children: '다음',
    width: '200px',
    height: '60px',
  },
};

export const WithRightIcon: Story = {
  args: {
    children: '확인',
    rightIcon: <IconBox name='chevron-right' size={16} />,
  },
};

export const CompactButton: Story = {
  args: {
    children: '다음',
    padding: '8px 12px',
    fontSize: '14px',
    width: 'auto',
  },
};

export const LargeButton: Story = {
  args: {
    children: '다음',
    padding: '20px 36px',
    fontSize: '22px',
  },
};

export const DisabledButton: Story = {
  args: {
    children: '다음',
    disabled: true,
  },
};
