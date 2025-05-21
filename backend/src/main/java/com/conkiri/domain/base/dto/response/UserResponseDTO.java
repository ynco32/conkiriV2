package com.conkiri.domain.base.dto.response;

import com.conkiri.domain.user.entity.User;

public record UserResponseDTO(
	Long userId,
	String nickname,
	String email,
	String userName,
	Integer profileNumber,
	String anonym

) {
	public static UserResponseDTO from(User user) {
		return new UserResponseDTO(
			user.getUserId(),
			user.getNickname(),
			user.getEmail(),
			user.getUserName(),
			user.getProfileNumber(),
			user.getAnonym()
		);
	}
}