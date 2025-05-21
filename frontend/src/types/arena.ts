// src/types/arena.ts
import { ApiResponse } from './api';

/**
 * 공연장 정보 타입 정의
 */
export interface ArenaInfo {
  /** 경기장 ID */
  arenaId: number;

  /** 경기장 이름 */
  arenaName: string;

  /** 경기장 영어 이름 */
  arenaEngName: string;

  /** 주소 */
  address: string;

  /** 위도 */
  latitude: number;

  /** 경도 */
  longitude: number;

  /** 경기장 사진 URL */
  photoUrl: string;
}

export interface ArenaListApi {
  arenas: ArenaInfo[];
}

/**
 * 경기장 목록을 위한 API 응답 타입
 */
export type ArenaListResponse = ApiResponse<ArenaListApi>;

/**
 * 경기장 구역 정보 타입 정의
 */
export interface ArenaSection {
  /** 구역 이름 */
  section: string;

  /** 층 정보 */
  floor: number;
}

/**
 * 경기장 구역 목록을 위한 API 응답 타입
 */
export type ArenaSectionsResponse = ApiResponse<ArenaSection[]>;

/**
 * 단일 좌석 정보 타입 정의
 */
export interface Seat {
  seat: number;
  seatId: number;
  isReviewed: boolean;
}

/**
 * 줄 별 좌석 정보 타입 정의
 */
export interface SeatRow {
  row: string;
  activeSeats: Seat[];
}

/**
 * 경기장 구역 목록을 위한 API 응답 타입
 */
export interface SectionSeatsApi {
  section: string;
  seatMap: SeatRow[];
}
export type SectionSeatsResponse = ApiResponse<SectionSeatsApi>;
