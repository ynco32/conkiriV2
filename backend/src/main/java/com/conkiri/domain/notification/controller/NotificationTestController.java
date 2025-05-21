package com.conkiri.domain.notification.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.repository.ConcertRepository;
import com.conkiri.domain.notification.service.FCMService;
import com.conkiri.global.common.ApiResponse;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.scheduler.NotificationScheduler;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class NotificationTestController {

	private final NotificationScheduler notificationScheduler;
	private final ConcertRepository concertRepository;
	private final FCMService	fcmService;

	@PostMapping("/concert-open/{concertId}")
	public ApiResponse<Void> triggerConcertOpenNotification(@PathVariable Long concertId) {
		Concert concert = concertRepository.findById(concertId)
			.orElseThrow(() -> new BaseException(ErrorCode.CONCERT_NOT_FOUND));
		notificationScheduler.sendConcertOpenNotifications(concert);
		return ApiResponse.ofSuccess();
	}

	@PostMapping("/ticketing-day")
	public ApiResponse<Void> triggerTicketingDayNotifications() {
		notificationScheduler.sendTicketingDayNotifications();
		return ApiResponse.ofSuccess();
	}

	@PostMapping("/ticketing-soon")
	public ApiResponse<Void> triggerTicketingSoonNotifications() {
		notificationScheduler.sendTicketingSoonNotifications();
		return ApiResponse.ofSuccess();
	}

	@PostMapping("/concert-day")
	public ApiResponse<Void> triggerConcertDayNotifications() {
		notificationScheduler.sendConcertDayNotifications();
		return ApiResponse.ofSuccess();
	}

	@PostMapping("/concert-soon")
	public ApiResponse<Void> triggerConcertSoonNotifications() {
		notificationScheduler.sendConcertSoonNotifications();
		return ApiResponse.ofSuccess();
	}

	@PostMapping("/test-direct-fcm")
	public ApiResponse<Boolean> testDirectFcm(
		@RequestParam String token,
		@RequestParam String title,
		@RequestParam String body) {

		Map<String, String> data = new HashMap<>();
		data.put("url", "/test");

		boolean success = fcmService.sendPushNotification(
			true, token, title, body, data);

		return ApiResponse.success(success);
	}
}
