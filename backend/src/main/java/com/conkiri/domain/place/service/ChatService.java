package com.conkiri.domain.place.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.place.dto.request.ChatMessageRequestDTO;
import com.conkiri.domain.place.dto.response.ChatMessageDTO;
import com.conkiri.domain.place.dto.response.ChatMessageDetailDTO;
import com.conkiri.domain.place.dto.response.ChatWebSocketMessageDTO;
import com.conkiri.domain.place.entity.ChatMessage;
import com.conkiri.domain.place.entity.ChatRoom;
import com.conkiri.domain.place.repository.ChatMessageRepository;
import com.conkiri.domain.place.repository.ChatRoomRepository;
import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.service.UserReadService;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {

	private final ChatMessageRepository messageRepository;
	private final ChatRoomRepository chatRoomRepository;
	private final RedisTemplate<String, Object> chatRedisTemplate;
	private final UserReadService userReadService;

	// 최신 메시지 조회
	public ChatMessageDTO getLatestMessages(Long chatRoomId) {

		List<ChatMessageDetailDTO> dbMessages = getRecentMessagesFromDB(chatRoomId);
		List<ChatMessageDetailDTO> redisMessages = getPendingMessagesFromRedis(chatRoomId);

		List<ChatMessageDetailDTO> allMessages = new ArrayList<>();
		allMessages.addAll(dbMessages);
		allMessages.addAll(redisMessages);

		allMessages.sort(Comparator.comparing(ChatMessageDetailDTO::createdAt));
		return new ChatMessageDTO(allMessages);
	}

	private List<ChatMessageDetailDTO> getRecentMessagesFromDB(Long chatRoomId) {

		PageRequest pageable = PageRequest.of(0, 50);
		Slice<ChatMessage> dbMessages = messageRepository.findByChatRoomIdWithUserAndParent(chatRoomId, pageable);

		return dbMessages.getContent().stream()
			.map(ChatMessageDetailDTO::from)
			.toList();
	}

	private List<ChatMessageDetailDTO> getPendingMessagesFromRedis(Long chatRoomId) {
		String listKey = "chat:pending:" + chatRoomId;
		List<Object> rawMessages = chatRedisTemplate.opsForList().range(listKey, 0, -1);

		log.info("Redis 키 {}: 조회된 메시지 수 = {}", listKey,
			rawMessages != null ? rawMessages.size() : 0);

		if (rawMessages == null || rawMessages.isEmpty()) {
			return List.of();
		}

		List<ChatMessageDetailDTO> result = new ArrayList<>();

		for (Object obj : rawMessages) {
			log.info("메시지 타입: {}", obj.getClass().getName());

			try {
				// Map 형태로 역직렬화된 경우를 처리
				if (obj instanceof Map) {
					Map<String, Object> map = (Map<String, Object>) obj;
					result.add(convertMapToDetailDTO(map));
				}
				// 원래 타입으로 정상 역직렬화된 경우
				else if (obj instanceof ChatWebSocketMessageDTO) {
					ChatWebSocketMessageDTO wsMsg = (ChatWebSocketMessageDTO) obj;
					result.add(convertWebSocketDTOToDetailDTO(wsMsg));
				}
				else {
					log.warn("처리할 수 없는 메시지 타입: {}", obj.getClass().getName());
				}
			} catch (Exception e) {
				log.error("메시지 변환 오류: {}", e.getMessage(), e);
			}
		}

		log.info("반환될 메시지 수: {}", result.size());
		return result;
	}

	private ChatMessageDetailDTO convertMapToDetailDTO(Map<String, Object> map) {
		// Map에서 필드 추출
		Long parentMessageId = null;
		if (map.get("parentMessageId") instanceof Number) {
			parentMessageId = ((Number) map.get("parentMessageId")).longValue();
		}

		Long senderId = null;
		if (map.get("senderId") instanceof Number) {
			senderId = ((Number) map.get("senderId")).longValue();
		}

		LocalDateTime createdAt = LocalDateTime.now();
		if (map.get("createdAt") instanceof String) {
			try {
				createdAt = LocalDateTime.parse((String) map.get("createdAt"));
			} catch (Exception e) {
				log.warn("날짜 파싱 오류: {}", e.getMessage());
			}
		}

		return new ChatMessageDetailDTO(
			null,
			(String) map.get("tempId"),
			senderId,
			(String) map.get("senderNickname"),
			(String) map.get("content"),
			parentMessageId,
			(String) map.get("parentTempId"),
			(String) map.get("parentContent"),
			(String) map.get("parentSenderNickname"),
			createdAt
		);
	}

	private ChatMessageDetailDTO convertWebSocketDTOToDetailDTO(ChatWebSocketMessageDTO wsMsg) {

		return new ChatMessageDetailDTO(
			null,
			wsMsg.tempId(),
			wsMsg.senderId(),
			wsMsg.senderNickname(),
			wsMsg.content(),
			wsMsg.parentMessageId(),
			wsMsg.parentTempId(),
			wsMsg.parentContent(),
			wsMsg.parentSenderNickname(),
			wsMsg.createdAt()
		);
	}

	// 이전 메시지 조회 (무한 스크롤)
	public ChatMessageDTO getMessagesBeforeTime(Long chatRoomId, LocalDateTime beforeTime, int size) {
		List<ChatMessageDetailDTO> messages = getOldMessagesFromDB(chatRoomId, beforeTime, size);

		// 정렬 가능한 새 리스트 생성 후 정렬
		List<ChatMessageDetailDTO> sortedMessages = new ArrayList<>(messages);
		sortedMessages.sort((m1, m2) -> {
			if (m1.createdAt() == null && m2.createdAt() == null) return 0;
			if (m1.createdAt() == null) return -1;
			if (m2.createdAt() == null) return 1;
			return m1.createdAt().compareTo(m2.createdAt());
		});

		return new ChatMessageDTO(sortedMessages);
	}

	private List<ChatMessageDetailDTO> getOldMessagesFromDB(Long chatRoomId, LocalDateTime beforeTime, int size) {

		PageRequest pageable = PageRequest.of(0, size);
		Slice<ChatMessage> messages = messageRepository.findByChatRoomIdBeforeTimeWithUserAndParent(chatRoomId, beforeTime, pageable);

		return messages.getContent().stream()
			.map(ChatMessageDetailDTO::from)
			.toList();
	}

	// 메시지 생성 및 Redis 저장
	public ChatWebSocketMessageDTO processAndSaveMessage(Long chatRoomId, ChatMessageRequestDTO request, Long userId) {

		User user = userReadService.findUserByIdOrElseThrow(userId);
		String tempId = UUID.randomUUID().toString();

		ChatWebSocketMessageDTO message = createWebSocketMessage(request, user, tempId);
		saveToRedis(chatRoomId, message);

		return message;
	}

	private ChatWebSocketMessageDTO createWebSocketMessage(ChatMessageRequestDTO request, User user, String tempId) {

		if (request.parentTempId() == null && request.parentMessageId() == null) {
			return ChatWebSocketMessageDTO.createMessage(
				tempId,
				user.getUserId(),
				user.getAnonym(),
				request.content()
			);
		} else {
			return ChatWebSocketMessageDTO.createReply(
				tempId,
				user.getUserId(),
				user.getAnonym(),
				request.content(),
				request.parentTempId(),
				request.parentMessageId(),
				null,
				null
			);
		}
	}

	private void saveToRedis(Long chatRoomId, ChatWebSocketMessageDTO message) {

		String listKey = "chat:pending:" + chatRoomId;
		chatRedisTemplate.opsForList().rightPush(listKey, message);
		log.info("✅ Redis 저장 완료: {}", listKey);
	}

	// ========== 이하 공통 메서드 ==========

	private ChatRoom findChatRoom(Long chatRoomId) {
		return chatRoomRepository.findById(chatRoomId)
			.orElseThrow(() -> new BaseException(ErrorCode.CHAT_ROOM_NOT_FOUND));
	}
}