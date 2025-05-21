import { ApiResponse } from '@/types/api';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 서버 사이드에서만 사용할 API 클라이언트 (CORS 없음)
export const serverApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 10000,
});

export const apiRequest = async <T>(
  method: HttpMethod,
  url: string,
  data?: any,
  params?: any
): Promise<T | undefined> => {
  try {
    const response = await apiClient.request<ApiResponse<T>>({
      method,
      url,
      data,
      params,
    });
    return response.data.data;
  } catch (error: any) {
    const errorResponse = error.response?.data as ApiResponse<null>;
    if (errorResponse?.error) {
      throw {
        ...errorResponse.error,
      };
    }
  }
};

export const serverApiRequest = async <T>(
  method: HttpMethod,
  url: string,
  data?: any,
  params?: any
): Promise<T | undefined> => {
  try {
    const response = await serverApiClient.request<ApiResponse<T>>({
      method,
      url,
      data,
      params,
    });
    return response.data.data;
  } catch (error: any) {
    const errorResponse = error.response?.data as ApiResponse<null>;
    if (errorResponse?.error) {
      throw {
        ...errorResponse.error,
      };
    }
  }
};
