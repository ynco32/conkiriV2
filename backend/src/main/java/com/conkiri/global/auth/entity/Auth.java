package com.conkiri.global.auth.entity;

import java.time.LocalDateTime;

import com.conkiri.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Auth {

	@Id
	@Column(name = "auth_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long authId;

	@Column(unique = true)
	private String refreshToken;

	@Column
	private LocalDateTime expiryDate;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@Column(nullable = false, length = 20)
	private String provider;

	@Column(name = "provider_id", nullable = false)
	private String providerId;

	private Auth(String refreshToken, LocalDateTime expiryDate, User user, String provider, String providerId) {
		this.refreshToken = refreshToken;
		this.expiryDate = expiryDate;
		this.user = user;
		this.provider = provider;
		this.providerId = providerId;
	}

	public static Auth of(String refreshToken, LocalDateTime expiryDate, User user, String provider, String providerId) {
		return new Auth(refreshToken, expiryDate, user, provider, providerId);
	}

	public void updateToken(String refreshToken, LocalDateTime expiryDate) {
		this.refreshToken = refreshToken;
		this.expiryDate = expiryDate;
	}

}
