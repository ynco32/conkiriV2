import { apiClient } from '../api';
import { concert } from '@/types/concert'; // ReviewUpdateRequest 추가
import { ApiResponse } from '@/types/api';

export const concertApi = {
  /**
   * 콘서트 조회
   * @param searchWord 검색어
   * @returns 콘서트 목록
   */
  getConcerts: (searchWord: string) =>
    apiClient.get<ApiResponse<concert[]>>(
      `/api/v1/view/concerts?searchWord=${searchWord}`
    ),
};
