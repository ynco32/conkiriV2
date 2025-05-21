import type { Meta, StoryObj } from '@storybook/react';
import TabMenu from './TabMenu';

const meta: Meta<typeof TabMenu> = {
  title: 'Components/Common/TabMenu',
  component: TabMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    menuItems: {
      control: 'object',
      description: '탭 메뉴 아이템 목록',
    },
    defaultActiveIndex: {
      control: { type: 'number', min: 0 },
      description: '기본 선택될 메뉴 아이템의 인덱스',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: '탭 메뉴 크기',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: '탭 메뉴의 너비를 100%로 설정할지 여부',
    },
    onMenuItemClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof TabMenu>;

// 기본 메뉴 아이템 정의
const defaultMenuItems = [
  { name: '메뉴 1', link: '/menu1' },
  { name: '메뉴 2', link: '/menu2' },
  { name: '메뉴 3', link: '/menu3' },
];

// 기본 탭 메뉴
export const Default: Story = {
  args: {
    menuItems: defaultMenuItems,
    defaultActiveIndex: 0,
    size: 'md',
  },
};

// 전체 너비 탭 메뉴
export const FullWidth: Story = {
  args: {
    menuItems: defaultMenuItems,
    defaultActiveIndex: 0,
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

// 크기 변형
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <TabMenu menuItems={defaultMenuItems} size='sm' />
      <TabMenu menuItems={defaultMenuItems} size='md' />
      <TabMenu menuItems={defaultMenuItems} size='lg' />
    </div>
  ),
};

// 활성 탭 설정
export const ActiveTabs: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <TabMenu menuItems={defaultMenuItems} defaultActiveIndex={0} />
      <TabMenu menuItems={defaultMenuItems} defaultActiveIndex={1} />
      <TabMenu menuItems={defaultMenuItems} defaultActiveIndex={2} />
    </div>
  ),
};

// 다양한 메뉴 아이템 수
export const ManyMenuItems: Story = {
  args: {
    menuItems: [
      { name: '유기견 소개', link: '/dogs' },
      { name: '입양 신청', link: '/adoption' },
      { name: '후원하기', link: '/donation' },
      { name: '봉사활동', link: '/volunteer' },
      { name: '입양 후기', link: '/reviews' },
    ],
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => (
    <div
      style={{
        width: '100%',
        maxWidth: '800px',
        border: '1px solid #eaeaea',
        borderRadius: '8px',
        padding: '24px',
      }}
    >
      <h2 style={{ marginBottom: '16px' }}>유기견 후원 프로그램</h2>
      <TabMenu
        menuItems={[
          { name: '프로그램 소개', link: '/program' },
          { name: '후원 방법', link: '/donation' },
          { name: '후원금 사용 내역', link: '/usage' },
        ]}
        fullWidth={true}
      />
      <div style={{ padding: '24px 0' }}>
        <h3>프로그램 소개</h3>
        <p>
          유기견 후원 프로그램은 버려진 강아지들에게 새로운 희망을 제공합니다.
          여러분의 작은 후원이 큰 변화를 만들 수 있습니다.
        </p>
      </div>
    </div>
  ),
};

// 커스텀 스타일링
export const CustomStyling: Story = {
  render: () => (
    <TabMenu menuItems={defaultMenuItems} className='custom-tab-menu' />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`className` prop을 사용하여 커스텀 스타일을 적용할 수 있습니다.',
      },
    },
  },
};
