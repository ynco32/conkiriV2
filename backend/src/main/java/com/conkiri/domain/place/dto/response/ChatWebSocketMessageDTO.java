package com.conkiri.domain.place.dto.response;

import java.time.LocalDateTime;

public record ChatWebSocketMessageDTO(
	String tempId,
	Long senderId,
	String senderNickname,
	String content,
	String parentTempId,
	Long parentMessageId,
	String parentContent,
	String parentSenderNickname,
	LocalDateTime createdAt
) {
	// 일반 메시지 생성
	public static ChatWebSocketMessageDTO createMessage(
		String tempId, Long senderId, String senderNickname, String content) {
		return new ChatWebSocketMessageDTO(
			tempId,
			senderId,
			senderNickname,
			content,
			null, null, null, null,
			LocalDateTime.now()
		);
	}

	// 답글 메시지 생성
	public static ChatWebSocketMessageDTO createReply(
		String tempId, Long senderId, String senderNickname, String content,
		String parentTempId, Long parentMessageId,
		String parentContent, String parentSenderNickname) {
		return new ChatWebSocketMessageDTO(
			tempId,
			senderId,
			senderNickname,
			content,
			parentTempId,
			parentMessageId,
			parentContent,
			parentSenderNickname,
			LocalDateTime.now()
		);
	}
}