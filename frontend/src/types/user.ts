/**
 * 사용자 정보 타입 정의
 */
export interface UserInfo {
  /** 사용자 ID */
  userId: number;

  /** 사용자 닉네임 */
  nickname: string;

  /** 사용자 이메일 */
  email: string;

  /** 사용자 이름 */
  userName: string;

  /** 프로필 이미지 번호 (선택적) */
  profileNumber?: number;

  /** 랜덤 닉네임 */
  anonym: string;
}
