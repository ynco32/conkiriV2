package com.conkiri.domain.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.repository.UserRepository;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final UserReadService userReadService;

	public void updateFcmToken(User user, String fcmToken) {

		user.updateFcmToken(fcmToken);
	}

	public void updateNotificationEnabled(User user) {

		user.updateNotificationStatus();
	}


	public void updateNickname(Long userId, String nickname) {

		User user = userReadService.findUserByIdOrElseThrow(userId);
		validateNicknameDuplicate(nickname);
		user.updateNickname(nickname);
	}

	public void updateProfile(Long userId, Integer profileNumber) {

		User user = userReadService.findUserByIdOrElseThrow(userId);
		user.updateProfileNumber(profileNumber);
	}

	public boolean checkNicknameExists(String nickname) {
		return !userRepository.existsByNickname(nickname);
	}

	private void validateNicknameDuplicate(String nickname) {

		if (userRepository.existsByNickname(nickname)) {
			throw new BaseException(ErrorCode.DUPLICATE_NICKNAME);
		}
	}

	public String generateAnonymNickname(Long userId) {
		String[] adjectives = {"행복한", "용감한", "신비한", "귀여운", "멋진", "활발한", "재미있는", "지혜로운", "친절한", "아름다운",
			"느긋한", "조용한", "당당한", "화려한", "우아한", "사랑스러운", "따뜻한", "시원한", "엉뚱한", "정직한"};

		int adjectiveIndex = Math.abs(userId.hashCode()) % adjectives.length;
		String adjective = adjectives[adjectiveIndex];

		return adjective + " 코끼리 " + userId;
	}

	@Transactional
	public void createAndSetAnonymNickname(User user) {
		String anonymNickname = generateAnonymNickname(user.getUserId());
		user.updateAnonym(anonymNickname);
	}
}
