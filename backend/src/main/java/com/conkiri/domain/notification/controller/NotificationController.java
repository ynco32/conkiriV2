package com.conkiri.domain.notification.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.notification.dto.request.FcmTokenRequestDTO;
import com.conkiri.domain.notification.dto.response.NotificationResponseDTO;
import com.conkiri.domain.notification.service.NotificationFacadeService;
import com.conkiri.global.auth.token.UserPrincipal;
import com.conkiri.global.common.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

	private final NotificationFacadeService notificationFacadeService;

	/**
	 * 알림 목록 조회
	 */
	@GetMapping
	public ApiResponse<List<NotificationResponseDTO>> getNotifications(
		@AuthenticationPrincipal UserPrincipal user) {

		return ApiResponse.success(notificationFacadeService.getNotifications(user.getUser()));
	}

	/**
	 * 읽지 않은 알림 여부 확인
	 */
	@GetMapping("/unread")
	public ApiResponse<Boolean> getUnreadNotifications(
		@AuthenticationPrincipal UserPrincipal user) {

		return ApiResponse.success(notificationFacadeService.hasUnreadNotifications(user.getUser()));
	}

	/**
	 * 특정 알림 읽음 처리
	 */
	@PatchMapping("/{notificationId}/read")
	public ApiResponse<Void> markAsRead(
		@PathVariable Long notificationId,
		@AuthenticationPrincipal UserPrincipal user) {

		notificationFacadeService.markAsRead(user.getUser(), notificationId);
		return ApiResponse.ofSuccess();
	}

	/**
	 * 모든 알림 읽음 처리
	 */
	@PatchMapping("/read-all")
	public ApiResponse<Void> markAllAsRead(
		@AuthenticationPrincipal UserPrincipal user) {

		notificationFacadeService.markAllAsRead(user.getUser());
		return ApiResponse.ofSuccess();
	}

	/**
	 * FCM 토큰 등록
	 */
	@PostMapping("/fcm-token")
	public ApiResponse<Void> saveFcmToken(
		@RequestBody @Valid FcmTokenRequestDTO dto,
		@AuthenticationPrincipal UserPrincipal user) {

		notificationFacadeService.updateFcmToken(user.getUser().getUserId(), dto.fcmToken());
		return ApiResponse.ofSuccess();
	}

	/**
	 * 알림 설정 변경
	 */
	@PatchMapping("/settings")
	public ApiResponse<Void> updateNotificationSettings(
		@AuthenticationPrincipal UserPrincipal user) {

		notificationFacadeService.toggleNotificationSettings(user.getUser().getUserId());
		return ApiResponse.ofSuccess();
	}

	/**
	 * 알림 설정 조회
	 */
	@GetMapping("/settings")
	public ApiResponse<Boolean> getNotificationSettings(
		@AuthenticationPrincipal UserPrincipal user) {

		return ApiResponse.success(user.getUser().isNotificationEnabled());
	}

	@DeleteMapping
	public ApiResponse<Void> deleteAllNotifications(
		@AuthenticationPrincipal UserPrincipal user) {

		notificationFacadeService.deleteAllNotifications(user.getUser());
		return ApiResponse.ofSuccess();
	}

	@DeleteMapping("/{notificationId}")
	public ApiResponse<Void> deleteNotification(
		@PathVariable Long notificationId,
		@AuthenticationPrincipal UserPrincipal user) {

		notificationFacadeService.deleteNotification(user.getUser(), notificationId);
		return ApiResponse.ofSuccess();
	}
}