package com.conkiri.domain.place.entity;

import com.conkiri.domain.user.entity.User;
import com.conkiri.global.common.BaseTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessage extends BaseTime {

	@Id
	@Column(name = "message_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long messageId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sender_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "chat_room_id", nullable = false)
	private ChatRoom chatRoom;

	@Column(name = "content", length = 200, nullable = false)
	private String content;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "parent_message_id")
	private ChatMessage parentMessage;

	@Column(name = "temp_id", unique = true)
	private String tempId;

	// 새로 추가된 필드
	@Column(name = "parent_content", length = 200)
	private String parentContent;

	@Column(name = "parent_sender_nickname", length = 100)
	private String parentSenderNickname;

	// 기존 5개 파라미터를 받는 of 메서드
	public static ChatMessage of(User user, ChatRoom chatRoom, String content, ChatMessage parentMessage, String tempId) {
		return new ChatMessage(user, chatRoom, content, parentMessage, tempId, null, null);
	}

	// 새로 추가한 4개 파라미터를 받는 of 메서드 (부모 메시지가 없는 경우)
	public static ChatMessage of(User user, ChatRoom chatRoom, String content, String tempId) {
		return new ChatMessage(user, chatRoom, content, null, tempId, null, null);
	}

	// 부모 내용을 포함한 새로운 of 메서드
	public static ChatMessage ofWithParentInfo(User user, ChatRoom chatRoom, String content,
		ChatMessage parentMessage, String tempId,
		String parentContent, String parentSenderNickname) {
		return new ChatMessage(user, chatRoom, content, parentMessage, tempId,
			parentContent, parentSenderNickname);
	}

	// 생성자 확장
	private ChatMessage(User user, ChatRoom chatRoom, String content, ChatMessage parentMessage,
		String tempId, String parentContent, String parentSenderNickname) {
		this.user = user;
		this.chatRoom = chatRoom;
		this.content = content;
		this.parentMessage = parentMessage;
		this.tempId = tempId;
		this.parentContent = parentContent;
		this.parentSenderNickname = parentSenderNickname;
	}

	// 부모 메시지를 설정하면서 관련 정보도 함께 저장
	public void setParentMessage(ChatMessage parentMessage) {
		this.parentMessage = parentMessage;

		// 부모 메시지가 존재하는 경우 정보 저장
		if (parentMessage != null) {
			try {
				this.parentContent = parentMessage.getContent();

				if (parentMessage.getUser() != null) {
					this.parentSenderNickname = parentMessage.getUser().getAnonym();
				}
			} catch (Exception e) {
				// 지연 로딩 또는 기타 오류 처리 - 조용히 무시하거나 로깅
			}
		}
	}

	// 부모 메시지 내용과 작성자 직접 설정 메서드 (parentMessage 없이도 설정 가능)
	public void setParentInfo(String parentContent, String parentSenderNickname) {
		this.parentContent = parentContent;
		this.parentSenderNickname = parentSenderNickname;
	}
}