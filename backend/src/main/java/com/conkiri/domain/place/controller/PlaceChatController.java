package com.conkiri.domain.place.controller;

import java.util.Map;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.conkiri.domain.place.dto.request.ChatMessageRequestDTO;
import com.conkiri.domain.place.dto.response.ChatWebSocketMessageDTO;
import com.conkiri.domain.place.service.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class PlaceChatController {

	private final ChatService chatService;
	private final SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/chat/{chatRoomId}")
	public void handleMessage(
		@DestinationVariable Long chatRoomId,
		ChatMessageRequestDTO request,
		SimpMessageHeaderAccessor accessor) {

		UserSessionInfo sessionInfo = extractUserSessionInfo(accessor);
		if (sessionInfo == null) {
			log.warn("세션에 사용자 정보 없음. 메시지 처리 차단됨.");
			return;
		}

		log.info("메시지 수신: {}, 채팅방: {}", request.content(), chatRoomId);

		ChatWebSocketMessageDTO message = chatService.processAndSaveMessage(chatRoomId, request, sessionInfo.userId());

		messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId, message);
	}

	private UserSessionInfo extractUserSessionInfo(SimpMessageHeaderAccessor accessor) {
		Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
		if (sessionAttributes == null) return null;

		Long userId = (Long) sessionAttributes.get("userId");
		String nickname = (String) sessionAttributes.get("nickname");

		if (userId == null || nickname == null) return null;
		return new UserSessionInfo(userId, nickname);
	}

	private record UserSessionInfo(Long userId, String nickname) {}
}
