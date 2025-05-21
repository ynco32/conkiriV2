export interface Message {
  id: number;
  nickname: string;
  content: string;
  time: string;
  replyToId?: number;
}
