package com.conkiri.domain.place.dto.response;

import java.util.List;

import com.conkiri.domain.place.entity.ChatMessage;

public record ChatMessageDTO(
	List<ChatMessageDetailDTO> messages
) {
	public static ChatMessageDTO from(List<ChatMessage> messages) {
		return new ChatMessageDTO(
			messages.stream()
				.map(message -> ChatMessageDetailDTO.from(message))
				.toList()
		);
	}
}