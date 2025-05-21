import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ReviewSelect } from './ReviewSelect';

export default {
  title: 'sight/ReviewSelect',
  component: ReviewSelect,
  parameters: {
    layout: 'centered',
  },
} as Meta;

// 기본 템플릿
const Template: StoryFn<typeof ReviewSelect> = (args) => {
  const [value, setValue] = useState<string | undefined>(
    args.value as string | undefined
  );

  return (
    <div className='p-6 bg-gray-100 rounded-lg'>
      <ReviewSelect
        {...args}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      />
    </div>
  );
};

// 아티스트 평가 옵션
export const ArtistReview = Template.bind({});
ArtistReview.args = {
  options: [
    { label: '아이컨택이 가능해요', value: 'EYE_CONTACT', color: '#8AE66E' },
    { label: '표정이 보여요', value: 'SEE_EXPRESSION', color: '#FFD849' },
    { label: '전광판을 봐야 해요', value: 'NEED_SCREEN', color: '#FFD68A' },
    { label: '망원경이 필요해요', value: 'NEED_BINOCULARS', color: '#FFA3A3' },
    { label: '같은 공간에 있어요', value: 'SAME_SPACE', color: '#FF7272' },
  ],
};

// 스크린 가시성 옵션
export const ScreenVisibility = Template.bind({});
ScreenVisibility.args = {
  options: [
    { label: '잘 보여요', value: 'GOOD', color: '#8AE66E' },
    { label: '측면이에요', value: 'SIDE', color: '#FFF568' },
    { label: '가려요', value: 'BLOCKED', color: '#FF7272' },
  ],
};

// 무대 가시성 옵션
export const StageVisibility = Template.bind({});
StageVisibility.args = {
  options: [
    { label: '잘 보여요', value: 'GOOD', color: '#8AE66E' },
    { label: '측면이에요', value: 'SIDE', color: '#FFF568' },
    { label: '가려요', value: 'BLOCKED', color: '#FF7272' },
  ],
};

// 전체 시나리오를 한번에 보여주는 스토리
export const AllReviewOptions = () => {
  const [artistValue, setArtistValue] = useState<string | undefined>();
  const [screenValue, setScreenValue] = useState<string | undefined>();
  const [stageValue, setStageValue] = useState<string | undefined>();

  return (
    <div className='p-6 bg-gray-100 rounded-lg space-y-8'>
      <h1 className='text-2xl font-bold mb-6'>시야 후기</h1>

      <div>
        <h3 className='text-blue-600 mb-3'>자리에서 아티스트가 잘 보였나요?</h3>
        <ReviewSelect
          options={[
            {
              label: '아이컨택이 가능해요',
              value: 'EYE_CONTACT',
              color: '#8AE66E',
            },
            {
              label: '표정이 보여요',
              value: 'SEE_EXPRESSION',
              color: '#FFD849',
            },
            {
              label: '전광판을 봐야 해요',
              value: 'NEED_SCREEN',
              color: '#FFA3A3',
            },
            {
              label: '망원경이 필요해요',
              value: 'NEED_BINOCULARS',
              color: '#FF7272',
            },
            {
              label: '같은 공간에 있어요',
              value: 'SAME_SPACE',
              color: '#FF7272',
            },
          ]}
          value={artistValue}
          onChange={setArtistValue}
        />
      </div>

      <div>
        <h3 className='text-blue-600 mb-3'>자리에서 스크린이 잘 보였나요?</h3>
        <ReviewSelect
          options={[
            { label: '잘 보여요', value: 'GOOD', color: '#8AE66E' },
            { label: '측면이에요', value: 'SIDE', color: '#FFF568' },
            { label: '가려요', value: 'BLOCKED', color: '#FF7272' },
          ]}
          value={screenValue}
          onChange={setScreenValue}
        />
      </div>

      <div>
        <h3 className='text-blue-600 mb-3'>자리에서 무대가 잘 보였나요?</h3>
        <ReviewSelect
          options={[
            { label: '잘 보여요', value: 'GOOD', color: '#8AE66E' },
            { label: '측면이에요', value: 'SIDE', color: '#FFF568' },
            { label: '가려요', value: 'BLOCKED', color: '#FF7272' },
          ]}
          value={stageValue}
          onChange={setStageValue}
        />
      </div>
    </div>
  );
};
