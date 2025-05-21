import { apiRequest, serverApiRequest } from '@/api/api';
import { ArtistResponse, ConcertResponse } from '@/types/mypage';

export const getArtists = async (search?: string, last?: number) => {
  return apiRequest<ArtistResponse>('GET', '/api/v1/artists', undefined, {
    search,
    last,
  });
};

export const editArtist = async (artistIds: number[]) => {
  return apiRequest<null>('PUT', '/api/v1/artists/my', {
    artistIds,
  });
};

export const getMyArtists = async (last?: number) => {
  return apiRequest<ArtistResponse>('GET', 'api/v1/artists/my', undefined, {
    last,
  });
};

export const deleteArtist = async (artistId: number) => {
  return apiRequest<null>('DELETE', `api/v1/artists/my/${artistId}`);
};

export const getConcerts = async (search?: string, last?: number) => {
  return apiRequest<ConcertResponse>('GET', 'api/v1/concerts', undefined, {
    search,
    last,
  });
};

export const editConcert = async (
  concertIds: number[],
  concertDetailIds: number[]
) => {
  return apiRequest<null>('PUT', '/api/v1/concerts/my', {
    concertIds,
    concertDetailIds,
  });
};

export const getMyConcerts = async (search?: string, last?: number) => {
  return apiRequest<ConcertResponse>('GET', '/api/v1/concerts/my', undefined, {
    search,
    last,
  });
};

export const deleteConcert = async (concertId: number) => {
  return apiRequest<null>('DELETE', `/api/v1/concerts/my/${concertId}`);
};
