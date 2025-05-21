import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import TextInput from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Components/Common/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    onChange: { action: 'changed' },
    placeholder: { control: 'text' },
    errorMessage: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    autoFocus: { control: 'boolean' },
    maxLength: { control: 'number' },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number'],
    },
    clearable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

// 기본 TextInput
export const Default: Story = {
  args: {
    value: '',
    placeholder: '닉네임을 입력해주세요',
    required: false,
    disabled: false,
    clearable: true,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
};

// 값이 있는 TextInput
export const WithValue: Story = {
  args: {
    value: '눈사람',
    placeholder: '닉네임을 입력해주세요',
    required: false,
    disabled: false,
    clearable: true,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
};

// 에러 메시지가 있는 TextInput
export const WithError: Story = {
  args: {
    value: '눈사람',
    placeholder: '닉네임을 입력해주세요',
    errorMessage: '이미 있는 닉네임은 사용할 수 없어요.',
    required: true,
    disabled: false,
    clearable: true,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
};

// 닉네임 입력 예제
export const NicknameExample: Story = {
  render: function Render() {
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');

    const handleChange = (value: string) => {
      setNickname(value);

      // 간단한 유효성 검사 예제
      if (value.length > 0 && value.length < 2) {
        setError('닉네임은 2자 이상이어야 합니다.');
      } else if (value.length > 10) {
        setError('닉네임은 10자 이하여야 합니다.');
      } else {
        setError('');
      }
    };

    return (
      <TextInput
        value={nickname}
        onChange={handleChange}
        placeholder='닉네임을 입력해주세요'
        errorMessage={error}
        required
        name='nickname'
        maxLength={20}
      />
    );
  },
};

// 다양한 상태 예제
export const AllStates: Story = {
  render: function Render() {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('눈사람');
    const [value3, setValue3] = useState('눈사람');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ marginBottom: '8px' }}>기본 상태</h3>
          <TextInput
            value={value1}
            onChange={setValue1}
            placeholder='닉네임을 입력해주세요'
          />
        </div>
        <div>
          <h3 style={{ marginBottom: '8px' }}>값이 있는 상태</h3>
          <TextInput
            value={value2}
            onChange={setValue2}
            placeholder='닉네임을 입력해주세요'
          />
        </div>
        <div>
          <h3 style={{ marginBottom: '8px' }}>에러 상태</h3>
          <TextInput
            value={value3}
            onChange={setValue3}
            placeholder='닉네임을 입력해주세요'
            errorMessage='이미 있는 닉네임을 사용할 수 없어요.'
          />
        </div>
        <div>
          <h3 style={{ marginBottom: '8px' }}>비활성화 상태</h3>
          <TextInput
            value='눈사람'
            onChange={() => {}}
            placeholder='닉네임을 입력해주세요'
            disabled
          />
        </div>
      </div>
    );
  },
};
