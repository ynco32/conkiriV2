import { apiRequest } from '@/api/api';
import { checkLoginResponse } from '@/types/auth';
import { UserInfo } from '@/types/user';

export const checkNickname = async (nickname: string) => {
  return apiRequest<boolean>('GET', `/api/v1/user/nickname/check`, undefined, {
    nickname,
  });
};

export const postNickname = async (nickname: string) => {
  return apiRequest<null>('POST', '/api/v1/user/nickname', { nickname });
};

export const patchNickname = async (nickname: string) => {
  return apiRequest<null>('PATCH', '/api/v1/user/nickname', { nickname });
};

export const checkLogin = async () => {
  return apiRequest<checkLoginResponse>('GET', '/api/v1/auth/login');
};

export const getUserProfile = async () => {
  return apiRequest<UserInfo>('GET', '/api/v1/main/user-info');
};

export const patchProfileImage = async (profileNumber: number) => {
  return apiRequest<null>('PATCH', '/api/v1/main/profile', {
    profileNumber,
  });
};

export const logout = async () => {
  return apiRequest<null>('POST', '/api/v1/auth/logout');
};
