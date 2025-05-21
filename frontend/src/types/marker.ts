import { ApiResponse } from './api';

// 마커 카테고리 타입
export type MarkerCategory = 'TOILET' | 'CONVENIENCE' | 'STORAGE' | 'TICKET';

// 카테고리별 세부 정보 타입
export interface ToiletDetail {
  stalls?: number;
  name?: string;
  tissue?: boolean;
  floor?: number;
}

export interface ConvenienceDetail {
  category?: string;
  things?: string;
}

export interface StorageDetail {
  name?: string;
  capacity?: number;
  fee?: string;
}

export interface TicketDetail {
  name?: string;
  openHours?: string;
}

// 모든 세부 정보 타입을 결합
export type MarkerDetail =
  | ToiletDetail
  | ConvenienceDetail
  | StorageDetail
  | TicketDetail;

// 마커 정보 타입
export interface Marker {
  markerId: number;
  latitude: number;
  longitude: number;
  category: MarkerCategory;
  detail?: MarkerDetail;
}

// 마커 목록 데이터 타입
export interface MarkersData {
  markers: Marker[];
}

// API 응답 타입
export type MarkersResponse = ApiResponse<MarkersData>;

// 카테고리 라벨 (UI 표시용)
export const CATEGORY_LABELS: Record<MarkerCategory, string> = {
  TOILET: '화장실',
  STORAGE: '물품 보관소',
  CONVENIENCE: '편의시설',
  TICKET: '공연 관련 시설',
};
