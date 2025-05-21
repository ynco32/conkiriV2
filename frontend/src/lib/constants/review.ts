// src/constants/gradeOptions.ts
import {
  ArtistGrade,
  StageGrade,
  ScreenGrade,
  GradeOption,
} from '@/types/review';

// 아티스트 시야 등급 옵션
export const ARTIST_GRADE_OPTIONS: GradeOption<ArtistGrade>[] = [
  {
    value: ArtistGrade.VERY_CLOSE,
    label: '아이컨택이 가능해요',
    color: '#4ADE80',
  },
  { value: ArtistGrade.CLOSE, label: '표정이 보여요', color: '#FACC15' },
  {
    value: ArtistGrade.MODERATE,
    label: '전광판을 봐야 해요',
    color: '#FACC15',
  },
  { value: ArtistGrade.FAR, label: '망원경이 필요해요', color: '#FB7185' },
  { value: ArtistGrade.VERY_FAR, label: '같은 곳에 있어요', color: '#F43F5E' },
];

// 스크린 시야 등급 옵션
export const SCREEN_GRADE_OPTIONS: GradeOption<ScreenGrade>[] = [
  { value: ScreenGrade.CLEAR, label: '잘 보여요', color: '#4ADE80' },
  { value: ScreenGrade.SIDE, label: '측면이에요', color: '#FACC15' },
  { value: ScreenGrade.BLOCKED, label: '가려요', color: '#F43F5E' },
];

// 무대 시야 등급 옵션
export const STAGE_GRADE_OPTIONS: GradeOption<StageGrade>[] = [
  { value: StageGrade.CLEAR, label: '잘 보여요', color: '#4ADE80' },
  { value: StageGrade.SIDE, label: '측면이에요', color: '#FACC15' },
  { value: StageGrade.BLOCKED, label: '가려요', color: '#F43F5E' },
];

// 카메라 브랜드 및 기종 데이터
export const CAMERA_BRANDS = [
  { label: '삼성', value: '삼성' },
  { label: '애플', value: '애플' },
];

// 브랜드별 기종 데이터
export const CAMERA_MODELS: Record<string, { label: string; value: string }[]> =
  {
    삼성: [
      { label: '갤럭시 S24 Ultra', value: '갤럭시 S24 Ultra' },
      { label: '갤럭시 S24', value: '갤럭시 S24' },
      { label: '갤럭시 S23', value: '갤럭시 S23' },
      { label: '갤럭시 노트 20', value: '갤럭시 노트 20' },
      { label: '갤럭시 Z 플립', value: '갤럭시 Z 플립' },
      { label: '갤럭시 Z 폴드', value: '갤럭시 Z 폴드' },
    ],
    애플: [
      { label: 'iPhone 16 Pro Max', value: 'iPhone 16 Pro Max' },
      { label: 'iPhone 16 Pro', value: 'iPhone 16 Pro' },
      { label: 'iPhone 16', value: 'iPhone 16' },
      { label: 'iPhone 15 Pro Max', value: 'iPhone 15 Pro Max' },
      { label: 'iPhone 15 Pro', value: 'iPhone 15 Pro' },
      { label: 'iPhone 15', value: 'iPhone 15' },
      { label: 'iPhone 14', value: 'iPhone 14' },
    ],
  };
