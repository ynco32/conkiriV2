package com.conkiri.domain.notification.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.notification.entity.Notification;
import com.conkiri.domain.notification.repository.NotificationRepository;
import com.conkiri.domain.user.entity.User;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationReadService {

	private final NotificationRepository notificationRepository;

	/**
	 * 사용자의 모든 알림 조회
	 */
	public List<Notification> getNotifications(User user) {
		return notificationRepository.findByUserWithConcertAndUser(user);
	}

	/**
	 * 읽지 않은 알림 존재 여부 확인
	 */
	public boolean hasUnreadNotifications(User user) {
		return notificationRepository.existsByUserAndIsRead(user, false);
	}

	/**
	 * 특정 알림 조회
	 */
	public Notification getNotification(Long notificationId) {
		return notificationRepository.findById(notificationId)
			.orElseThrow(() -> new BaseException(ErrorCode.NOTIFICATION_NOT_FOUND));
	}

	public void validateMyNotification(Notification notification, Long userId) {
		if (!notification.getUser().getUserId().equals(userId)) {
			throw new BaseException(ErrorCode.UNAUTHORIZED_ACCESS);
		}
	}
}