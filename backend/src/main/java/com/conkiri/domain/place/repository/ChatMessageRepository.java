package com.conkiri.domain.place.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.conkiri.domain.place.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

	// tempId로 메시지 찾기 (답글 처리용)
	Optional<ChatMessage> findByTempId(String tempId);

	// 채팅방 입장 시: 최신 메시지부터 N개 조회
	@Query("""
	SELECT m FROM ChatMessage m
		JOIN FETCH m.user
		LEFT JOIN FETCH m.parentMessage pm
		LEFT JOIN FETCH pm.user
		WHERE m.chatRoom.chatRoomId = :chatRoomId
		ORDER BY m.createdAt DESC
	""")
	Slice<ChatMessage> findByChatRoomIdWithUserAndParent(
		@Param("chatRoomId") Long chatRoomId,
		Pageable pageable
	);

	// 스크롤 올릴 때: 특정 시간보다 오래된 메시지들 조회
	@Query("""
	SELECT m FROM ChatMessage m
		JOIN FETCH m.user
		LEFT JOIN FETCH m.parentMessage pm
		LEFT JOIN FETCH pm.user
		WHERE m.chatRoom.chatRoomId = :chatRoomId
		  AND m.createdAt < :beforeTime
		ORDER BY m.createdAt DESC
	""")
	Slice<ChatMessage> findByChatRoomIdBeforeTimeWithUserAndParent(
		@Param("chatRoomId") Long chatRoomId,
		@Param("beforeTime") LocalDateTime beforeTime,
		Pageable pageable
	);

}