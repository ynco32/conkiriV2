package com.conkiri.domain.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.repository.UserRepository;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserReadService {

	private final UserRepository userRepository;

	public User findUserByEmailOrElseThrow(String email) {

		return userRepository.findByEmail(email)
			.orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
	}

	public User findUserByIdOrElseThrow(Long userId) {

		return userRepository.findById(userId)
			.orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
	}
}
