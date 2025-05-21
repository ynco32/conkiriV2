package com.conkiri.domain.place.controller;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.place.dto.response.ChatMessageDTO;
import com.conkiri.domain.place.service.ChatService;
import com.conkiri.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/place/chat")
@RequiredArgsConstructor
public class PlaceChatRestController {

	private final ChatService chatService;

	// 최신 메시지 조회
	@GetMapping("/chat-rooms/{chatRoomId}/messages")
	public ApiResponse<ChatMessageDTO> getMessages(
		@PathVariable Long chatRoomId) {

		return ApiResponse.success(chatService.getLatestMessages(chatRoomId));
	}

	// 이전 메시지 조회 (무한 스크롤)
	@GetMapping("/chat-rooms/{chatRoomId}/messages/before")
	public ApiResponse<ChatMessageDTO> getMessagesBeforeTime(
		@PathVariable Long chatRoomId,
		@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime beforeTime,
		@RequestParam(defaultValue = "30") int size) {

		return ApiResponse.success(chatService.getMessagesBeforeTime(chatRoomId, beforeTime, size));
	}
}