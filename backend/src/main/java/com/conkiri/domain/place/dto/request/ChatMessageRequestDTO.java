package com.conkiri.domain.place.dto.request;

public record ChatMessageRequestDTO(
	String content,
	String parentTempId,
	Long parentMessageId
) {}
