export interface ArtistResponse {
  artists: ArtistInfo[];
  isLastPage: boolean;
}

export interface ArtistInfo {
  artistId: number;
  artistName: string;
  photoUrl: string;
  isFollowing: boolean;
}

export interface ConcertResponse {
  concerts: ConcertInfo[];
  isLastPage: boolean;
}

export interface ConcertInfo {
  concertId: number;
  concertName: string;
  photoUrl: string;
  arenaName: string;
  ticketingNotificationEnabled: boolean;
  artists: ConcertArtistInfo[];
  sessions: ConcertDetailInfo[];
}

export interface ConcertArtistInfo {
  artistId: number;
  artistName: string;
}

export interface ConcertDetailInfo {
  concertDetailId: number;
  startTime: string;
  entranceNotificationEnabled: boolean;
  isEnded: boolean;
  attended: boolean;
}
