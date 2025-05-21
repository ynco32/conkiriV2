package com.conkiri.domain.notification.service;

import java.util.Map;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.repository.ConcertRepository;
import com.conkiri.domain.notification.dto.response.NotificationMessage;
import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.service.UserReadService;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.RabbitMQConstants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class NotificationConsumer {

	private final FCMService fcmService;
	private final UserReadService userService;
	private final NotificationWriteService notificationWriteService;
	private final ConcertRepository concertRepository;

	@RabbitListener(queues = RabbitMQConstants.NOTIFICATION_QUEUE)
	public void processNotification(NotificationMessage message) {

		try {
			User user = userService.findUserByIdOrElseThrow(message.userId());
			Concert concert = concertRepository.findById(message.concertId())
				.orElseThrow(() -> new BaseException(ErrorCode.CONCERT_NOT_FOUND));

			boolean success = fcmService.sendPushNotification(
				user.isNotificationEnabled(),
				user.getFcmToken(),
				message.title(),
				message.body(),
				Map.of("url", "/ticketing/real")
			);

			if (success)
				notificationWriteService.saveNotification(user, concert, message.title(), message.body(), message.type());
			else
				log.warn("FCM 전송 실패: userId={}, concertId={}, type={}", user.getUserId(), concert.getConcertId(), message.type());


		} catch (Exception e) {
			log.error("알림 처리 실패: message={}", message, e);
			throw e;
		}
	}
}