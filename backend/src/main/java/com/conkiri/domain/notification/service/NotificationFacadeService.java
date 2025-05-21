package com.conkiri.domain.notification.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.entity.Cast;
import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.repository.CastRepository;
import com.conkiri.domain.notification.dto.response.NotificationResponseDTO;
import com.conkiri.domain.notification.entity.Notification;
import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.service.UserReadService;
import com.conkiri.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationFacadeService {

	private final NotificationReadService readService;
	private final NotificationWriteService writeService;
	private final UserReadService userReadService;
	private final UserService userService;
	private final CastRepository castRepository;

	/**
	 * 사용자의 모든 알림 조회
	 */
	@Transactional(readOnly = true)
	public List<NotificationResponseDTO> getNotifications(User user) {

		List<Notification> notifications = readService.getNotifications(user);

		List<Concert> concerts = notifications.stream()
			.map(Notification::getConcert)
			.filter(Objects::nonNull)
			.distinct()
			.toList();

		List<Cast> allCasts = castRepository.findByConcertInWithArtist(concerts);
		Map<Long, List<Cast>> castMap = allCasts.stream()
			.collect(Collectors.groupingBy(cast -> cast.getConcert().getConcertId()));

		return notifications.stream()
			.map(notification -> {
				List<Cast> casts = notification.getConcert() != null ?
					castMap.getOrDefault(notification.getConcert().getConcertId(), List.of()) :
					List.of();
				return NotificationResponseDTO.of(notification, casts);
			})
			.toList();
	}

	/**
	 * 읽지 않은 알림 존재 여부 확인
	 */
	@Transactional(readOnly = true)
	public boolean hasUnreadNotifications(User user) {

		return readService.hasUnreadNotifications(user);
	}

	/**
	 * 특정 알림 읽음 처리
	 */
	@Transactional
	public void markAsRead(User user, Long notificationId) {

		Notification notification = readService.getNotification(notificationId);
		readService.validateMyNotification(notification, user.getUserId());
		writeService.markAsRead(notificationId);
	}

	/**
	 * 모든 알림 읽음 처리
	 */
	@Transactional
	public void markAllAsRead(User user) {

		writeService.markAllAsRead(user);
	}

	/**
	 * FCM 토큰 등록/업데이트
	 */
	@Transactional
	public void updateFcmToken(Long userId, String fcmToken) {
		User user = userReadService.findUserByIdOrElseThrow(userId);
		userService.updateFcmToken(user, fcmToken);
	}

	/**
	 * 알림 설정 변경
	 */
	@Transactional
	public void toggleNotificationSettings(Long userId) {
		User user = userReadService.findUserByIdOrElseThrow(userId);
		userService.updateNotificationEnabled(user);
	}

	@Transactional
	public void deleteAllNotifications(User user) {
		writeService.deleteAllNotifications(user);
	}

	@Transactional
	public void deleteNotification(User user, Long notificationId) {
		Notification notification = readService.getNotification(notificationId);
		readService.validateMyNotification(notification, user.getUserId());
		writeService.deleteNotification(notificationId);
	}
}
