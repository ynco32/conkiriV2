import { apiClient, serverApiClient } from '@/api/api';
import {
  ArenaListApi,
  ArenaSectionsResponse,
  SectionSeatsResponse,
} from '@/types/arena';

export const arenaApi = {
  /**
   * 경기장 목록 조회
   */
  getArenas: () => apiClient.get<ArenaListApi>('/api/v1/arena/arenas'),
  /**
   * 경기장 구역 목록 조회
   * @param arenaId 경기장 ID
   */
  getArenaSections: (arenaId: string) =>
    apiClient.get<ArenaSectionsResponse>(
      `/api/v1/view/arenas/${arenaId}/sections`
    ),

  /**
   * 구역 별 좌석 정보 조회
   */
  getSectionSeats: (arenaId: string, section: string) =>
    apiClient.get<SectionSeatsResponse>(
      `/api/v1/view/arenas/${arenaId}/sections/${section}`
    ),
};

// 서버 컴포넌트에서 사용할 API 함수
export const serverArenaApi = {
  /**
   * 서버에서 구역 별 좌석 정보 조회
   */
  getSectionSeats: async (arenaId: string, section: string) => {
    try {
      const response = await serverApiClient.get<SectionSeatsResponse>(
        `/api/v1/view/arenas/${arenaId}/sections/${section}`
      );
      return response.data;
    } catch (error) {
      console.error('서버에서 좌석 데이터 로딩 에러:', error);
      throw new Error('좌석 정보를 불러오는데 실패했습니다.');
    }
  },
};
