package com.conkiri.domain.place.dto.response;

import java.time.LocalDateTime;

import com.conkiri.domain.place.entity.ChatMessage;

public record ChatMessageDetailDTO(
	Long messageId,
	String tempId,
	Long senderId,
	String senderNickname,
	String content,
	Long parentMessageId,
	String parentTempId,
	String parentContent,
	String parentSenderNickname,
	LocalDateTime createdAt
) {
	public static ChatMessageDetailDTO from(ChatMessage message) {
		// 부모 메시지 참조
		ChatMessage parent = message.getParentMessage();

		// 부모 메시지 ID와 tempId 가져오기
		Long parentId = parent != null ? parent.getMessageId() : null;
		String parentTempId = parent != null ? parent.getTempId() : null;

		// 중요: 부모 내용과 작성자는 저장된 값 우선 사용
		String parentContent = message.getParentContent();
		String parentSenderNickname = message.getParentSenderNickname();

		// 저장된 값이 없고 부모 메시지 객체가 있다면 부모에서 정보 가져오기 시도
		if ((parentContent == null || parentSenderNickname == null) && parent != null) {
			try {
				if (parentContent == null) {
					parentContent = parent.getContent();
				}

				if (parentSenderNickname == null && parent.getUser() != null) {
					// 부모 익명 닉네임 사용
					parentSenderNickname = parent.getUser().getAnonym();
				}
			} catch (Exception e) {
				// 지연 로딩 오류 등 무시
			}
		}

		return new ChatMessageDetailDTO(
			message.getMessageId(),
			message.getTempId(),
			message.getUser().getUserId(),
			message.getUser().getAnonym(), // 익명 닉네임 사용
			message.getContent(),
			parentId,
			parentTempId,
			parentContent,
			parentSenderNickname,
			message.getCreatedAt()
		);
	}
}