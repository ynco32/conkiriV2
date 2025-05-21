package com.conkiri.domain.notification.entity;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.user.entity.User;
import com.conkiri.global.common.BaseTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseTime {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "notification_id")
	private Long notificationId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "concert_id")
	private Concert concert;

	@Column(nullable = false)
	private String title;

	@Lob
	@Column(nullable = false)
	private String body;

	@Enumerated(EnumType.STRING)
	@Column(name = "notification_type", nullable = false)
	private NotificationType notificationType;

	@Column(name = "is_read", nullable = false)
	private boolean isRead;

	private Notification(User user, Concert concert, String title, String body, NotificationType type) {
		this.user = user;
		this.concert = concert;
		this.title = title;
		this.body = body;
		this.notificationType = type;
		this.isRead = false;
	}

	// 정적 팩토리 메서드
	public static Notification of(User user, Concert concert, String title, String body, NotificationType type) {
		return new Notification(user, concert, title, body, type);
	}

	// 읽음 처리
	public void markAsRead() {
		this.isRead = true;
	}
}