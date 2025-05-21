package com.conkiri.global.config.scheduler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.conkiri.domain.place.entity.ChatMessage;
import com.conkiri.domain.place.entity.ChatRoom;
import com.conkiri.domain.place.repository.ChatMessageRepository;
import com.conkiri.domain.place.repository.ChatRoomRepository;
import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.service.UserReadService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatSchedulerConfig {

	private final PlatformTransactionManager transactionManager;
	private final ChatMessageRepository messageRepository;
	private final ChatRoomRepository chatRoomRepository;
	private final RedisTemplate<String, Object> chatRedisTemplate;
	private final UserReadService userReadService;

	// 1분마다 실행
	@Scheduled(fixedDelay = 60000)
	public void saveMessagesToDatabase() {
		log.info("시작: Redis 메시지 → MySQL DB 저장");

		Set<String> keys = chatRedisTemplate.keys("chat:pending:*");
		if (keys == null || keys.isEmpty()) {
			log.info("저장할 메시지 없음");
			return;
		}

		log.info("저장할 채팅방 수: {}", keys.size());

		TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);

		for (String key : keys) {
			try {
				txTemplate.execute(status -> {
					saveMessagesForRoom(key);
					return null;
				});
			} catch (Exception e) {
				log.error("채팅방 메시지 저장 실패: {}, 오류: {}", key, e.getMessage(), e);
				// 다른 채팅방은 계속 처리
			}
		}

		log.info("완료: Redis 메시지 → MySQL DB 저장");
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void saveMessagesForRoom(String key) {
		// 1. 채팅방 ID 추출 및 기본 정보 로드
		Long chatRoomId = extractChatRoomId(key);
		if (chatRoomId == null) return;

		log.info("채팅방 {} 메시지 저장 시작", chatRoomId);

		// 2. 채팅방 정보 조회
		ChatRoom chatRoom = findChatRoom(chatRoomId);

		// 3. Redis에서 메시지 로드
		List<Object> redisMessages = loadMessagesFromRedis(key, chatRoomId);
		if (redisMessages.isEmpty()) return;

		try {
			// 4. 메시지 변환 및 정렬
			List<Map<String, Object>> orderedMessages = convertAndSortMessages(redisMessages, chatRoomId);

			// 5. 디버깅: 정렬된 메시지 목록 출력
			logOrderedMessages(orderedMessages);

			// 6. 일반 메시지 처리 (부모가 없는 메시지)
			Map<String, ChatMessage> tempIdToMessageMap = new HashMap<>();
			List<ChatMessage> normalMessages = processNormalMessages(orderedMessages, chatRoom, tempIdToMessageMap);

			// 7. 디버깅: 맵에 저장된 메시지 정보 출력
			logMessageMap(tempIdToMessageMap);

			// 8. 일반 메시지 저장
			if (!normalMessages.isEmpty()) {
				messageRepository.saveAll(normalMessages);
				log.info("채팅방 {} 일반 메시지 {} 개 저장 완료", chatRoomId, normalMessages.size());
			}

			// 9. 답글 메시지 처리 (부모가 있는 메시지)
			List<ChatMessage> replyMessages = processReplyMessages(orderedMessages, chatRoom, tempIdToMessageMap);

			// 10. 답글 메시지 저장
			if (!replyMessages.isEmpty()) {
				messageRepository.saveAll(replyMessages);
				log.info("채팅방 {} 답글 메시지 {} 개 저장 완료", chatRoomId, replyMessages.size());
			}

			// 11. 성공적으로 처리됨, Redis에서 삭제
			chatRedisTemplate.delete(key);
			log.info("채팅방 {} Redis 키 삭제 완료", chatRoomId);

		} catch (Exception e) {
			log.error("채팅방 {} 메시지 저장 처리 중 오류 발생: {}", chatRoomId, e.getMessage(), e);
			throw e;
		}
	}

	// 채팅방 ID 추출
	private Long extractChatRoomId(String key) {
		String[] parts = key.split(":");
		if (parts.length < 3) {
			log.error("잘못된 Redis 키 형식: " + key);
			return null;
		}

		try {
			return Long.parseLong(parts[2]);
		} catch (NumberFormatException e) {
			log.error("채팅방 ID 파싱 실패: " + parts[2], e);
			return null;
		}
	}

	// 채팅방 조회
	private ChatRoom findChatRoom(Long chatRoomId) {
		return chatRoomRepository.findById(chatRoomId)
			.orElseThrow(() -> new IllegalStateException("채팅방을 찾을 수 없음: " + chatRoomId));
	}

	// Redis에서 메시지 로드
	private List<Object> loadMessagesFromRedis(String key, Long chatRoomId) {
		List<Object> redisMessages = chatRedisTemplate.opsForList().range(key, 0, -1);
		if (redisMessages == null || redisMessages.isEmpty()) {
			log.info("채팅방 {} 저장할 메시지 없음", chatRoomId);
			return List.of();
		}

		log.info("채팅방 {} 저장할 메시지 수: {}", chatRoomId, redisMessages.size());

		// 디버깅: 원본 Redis 메시지 출력
		for (int i = 0; i < redisMessages.size(); i++) {
			log.debug("원본 Redis 메시지 {}: {}", i, redisMessages.get(i));
		}

		return redisMessages;
	}

	// 메시지 변환 및 정렬
	private List<Map<String, Object>> convertAndSortMessages(List<Object> redisMessages, Long chatRoomId) {
		List<Map<String, Object>> converted = redisMessages.stream()
			.filter(msgObj -> msgObj instanceof Map)
			.map(msgObj -> {
				@SuppressWarnings("unchecked")
				Map<String, Object> msgMap = (Map<String, Object>) msgObj;
				return msgMap;
			})
			.sorted((m1, m2) -> {
				Object createdAt1 = m1.get("createdAt");
				Object createdAt2 = m2.get("createdAt");
				if (createdAt1 == null || createdAt2 == null) return 0;
				return createdAt1.toString().compareTo(createdAt2.toString());
			})
			.toList();

		log.info("채팅방 {} 메시지 변환 및 정렬 완료. 정렬된 메시지 수: {}", chatRoomId, converted.size());
		return converted;
	}

	// 정렬된 메시지 로그 출력
	private void logOrderedMessages(List<Map<String, Object>> orderedMessages) {
		log.info("정렬된 메시지 목록 (총 {}개):", orderedMessages.size());
		for (int i = 0; i < orderedMessages.size(); i++) {
			Map<String, Object> msg = orderedMessages.get(i);
			String tempId = (String) msg.get("tempId");
			Object parentTempId = msg.get("parentTempId");
			Object parentMsgId = msg.get("parentMessageId");
			String content = (String) msg.get("content");

			log.info("메시지 {}: tempId={}, content={}, parentTempId={}, parentMsgId={}",
				i, tempId, content, parentTempId, parentMsgId);
		}
	}

	// 일반 메시지 처리
	private List<ChatMessage> processNormalMessages(
		List<Map<String, Object>> orderedMessages,
		ChatRoom chatRoom,
		Map<String, ChatMessage> tempIdToMessageMap) {

		log.info("일반 메시지 처리 시작");
		List<ChatMessage> normalMessages = new ArrayList<>();

		for (Map<String, Object> msgMap : orderedMessages) {
			try {
				Object parentTempIdObj = msgMap.get("parentTempId");
				Object parentMsgIdObj = msgMap.get("parentMessageId");

				boolean isNormalMsg = (parentTempIdObj == null || parentTempIdObj.toString().isBlank())
					&& (parentMsgIdObj == null);

				if (isNormalMsg) {
					String tempId = (String) msgMap.get("tempId");
					Long senderId = ((Number) msgMap.get("senderId")).longValue();
					String content = (String) msgMap.get("content");

					log.info("일반 메시지 처리: tempId={}, senderId={}, content={}",
						tempId, senderId, content);

					User user = userReadService.findUserByIdOrElseThrow(senderId);
					ChatMessage msg = ChatMessage.of(user, chatRoom, content, null, tempId);

					// 중요: tempId -> 메시지 맵에 저장
					tempIdToMessageMap.put(tempId, msg);
					normalMessages.add(msg);

					log.debug("일반 메시지를 맵에 추가: tempId={}", tempId);
				}
			} catch (Exception e) {
				log.error("일반 메시지 처리 중 오류: {}", e.getMessage(), e);
			}
		}

		log.info("일반 메시지 처리 완료. 처리된 메시지 수: {}", normalMessages.size());
		return normalMessages;
	}

	// 맵에 저장된 메시지 로그 출력
	private void logMessageMap(Map<String, ChatMessage> tempIdToMessageMap) {
		log.info("tempIdToMessageMap 상태 (총 {}개 키):", tempIdToMessageMap.size());
		for (String key : tempIdToMessageMap.keySet()) {
			ChatMessage msg = tempIdToMessageMap.get(key);
			log.info(" - 키: {}, 메시지ID: {}, 내용: {}",
				key, msg.getMessageId(), msg.getContent());
		}
	}

	// 답글 메시지 처리
	private List<ChatMessage> processReplyMessages(
		List<Map<String, Object>> orderedMessages,
		ChatRoom chatRoom,
		Map<String, ChatMessage> tempIdToMessageMap) {

		log.info("답글 메시지 처리 시작");
		List<ChatMessage> replyMessages = new ArrayList<>();

		for (Map<String, Object> msgMap : orderedMessages) {
			try {
				Object parentTempIdObj = msgMap.get("parentTempId");
				Object parentMsgIdObj = msgMap.get("parentMessageId");

				boolean isReplyMsg = (parentTempIdObj != null && !parentTempIdObj.toString().isBlank())
					|| (parentMsgIdObj != null);

				// 답글 처리 부분 (processReplyMessages 메서드 내)
				if (isReplyMsg) {
					String tempId = (String) msgMap.get("tempId");
					Long senderId = ((Number) msgMap.get("senderId")).longValue();
					String content = (String) msgMap.get("content");

					// 부모 메시지 정보 추출 (맵에서 직접 가져오기)
					String parentContent = (String) msgMap.get("parentContent");
					String parentSenderNickname = (String) msgMap.get("parentSenderNickname");

					log.info("답글 메시지 처리: tempId={}, content={}, parentTempId={}, parentMsgId={}, parentContent={}",
						tempId, content, parentTempIdObj, parentMsgIdObj, parentContent);

					User user = userReadService.findUserByIdOrElseThrow(senderId);

					// 부모 정보를 포함한 메시지 생성
					ChatMessage reply = ChatMessage.ofWithParentInfo(
						user, chatRoom, content, null, tempId, parentContent, parentSenderNickname);

					boolean parentSet = false;

					// tempId로 부모 메시지 찾기
					if (parentTempIdObj != null && !parentTempIdObj.toString().isBlank()) {
						String parentTempId = parentTempIdObj.toString();
						ChatMessage parent = tempIdToMessageMap.get(parentTempId);

						if (parent != null) {
							reply.setParentMessage(parent);
							parentSet = true;
							log.info("답글의 부모 메시지 설정 성공 (tempId): {}", parentTempId);
						} else {
							// 맵에서 찾지 못한 경우 DB에서 찾기 시도
							Optional<ChatMessage> parentFromDbOptional = messageRepository.findByTempId(parentTempId);
							if (parentFromDbOptional.isPresent()) {
								ChatMessage parentFromDb = parentFromDbOptional.get();
								reply.setParentMessage(parentFromDb);
								parentSet = true;
								log.info("답글의 부모 메시지를 DB에서 찾음 (tempId): {}", parentTempId);
							} else {
								log.warn("답글의 부모 메시지를 찾을 수 없음 (tempId): {}", parentTempId);
							}
						}
					}

					// messageId로 부모 메시지 찾기 (tempId로 찾지 못한 경우)
					if (!parentSet && parentMsgIdObj != null) {
						Long parentMsgId = ((Number) parentMsgIdObj).longValue();
						boolean found = messageRepository.findById(parentMsgId)
							.map(parent -> {
								reply.setParentMessage(parent);
								log.info("답글의 부모 메시지 설정 성공 (messageId): {}", parentMsgId);
								return true;
							})
							.orElse(false);

						if (!found) {
							log.warn("답글의 부모 메시지를 찾을 수 없음 (messageId): {}", parentMsgId);
						}
					}

					// 부모를 찾지 못해도 부모 내용과 작성자 정보는 유지됨 (ofWithParentInfo에서 설정)

					tempIdToMessageMap.put(tempId, reply);
					replyMessages.add(reply);
				}
			} catch (Exception e) {
				log.error("답글 처리 중 오류: {}", e.getMessage(), e);
			}
		}

		log.info("답글 메시지 처리 완료. 처리된 메시지 수: {}", replyMessages.size());
		return replyMessages;
	}

	// 부모 메시지 상태 로그 출력
	private void logParentMessageState(ChatMessage parent) {
		try {
			log.debug("부모 메시지 상태: id={}, tempId={}, content={}, 작성자={}",
				parent.getMessageId(),
				parent.getTempId(),
				parent.getContent(),
				parent.getUser() != null ? parent.getUser().getNickname() : "null");
		} catch (Exception e) {
			log.warn("부모 메시지 상태 로깅 실패: {}", e.getMessage());
		}
	}
}