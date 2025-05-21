package com.conkiri.global.auth.dto;

public record TokenDTO(
	String accessToken,
	String refreshToken,
	long accessTokenExpiresIn
) {
}
