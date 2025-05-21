package com.conkiri.domain.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

	@Id
	@Column(name = "user_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long userId;

	@Column(name = "nickname", length = 100)
	private String nickname;

	@Column(name = "email", length = 100)
	private String email;

	@Column(name = "user_name", length = 100)
	private String userName;

	@Column(name = "role", length = 20)
	private String role;

	@Column(name = "fcm_token", length = 300)
	private String fcmToken;

	@Column(name = "notification_enabled", nullable = false)
	private boolean notificationEnabled;

	@Column(name = "profile_number")
	private Integer profileNumber;

	@Column(name = "anonym", length = 100)
	private String anonym;

	private User(String email, String userName, String nickname) {
		this.email = email;
		this.userName = userName;
		this.nickname = nickname;
		this.role = "ROLE_USER";
		this.notificationEnabled = false;
		this.profileNumber = 1;
	}

	public static User of(String email, String userName, String nickname) {
		return new User(email, userName, nickname);
	}

	public void updateNickname(String nickname) {
		this.nickname = nickname;
	}

	public void updateAnonym(String anonym) {
		this.anonym = anonym;
	}

	public void updateFcmToken(String fcmToken) {
		this.fcmToken = fcmToken;
	}

	public void updateNotificationStatus() {
		this.notificationEnabled = !this.notificationEnabled;
	}

	public void updateProfileNumber(Integer profileNumber) {
		this.profileNumber = profileNumber;
	}
}
