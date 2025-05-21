import { apiRequest } from '../api';
import { ChatbotResponse } from '../../types/chatbot';

export const getChatbotResponse = async (query: string, concertId: number) => {
  return await apiRequest<ChatbotResponse>('POST', '/api/v1/chatbot', {
    query,
    concertId,
  });
};
