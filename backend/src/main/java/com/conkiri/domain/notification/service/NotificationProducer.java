package com.conkiri.domain.notification.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.conkiri.domain.notification.dto.response.NotificationMessage;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.RabbitMQConstants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationProducer {

	private final RabbitTemplate rabbitTemplate;

	/**
	 * 알림 메시지를 RabbitMQ로 발행
	 */
	public void sendNotification(NotificationMessage message) {
		try {
			rabbitTemplate.convertAndSend(
				RabbitMQConstants.NOTIFICATION_EXCHANGE,
				RabbitMQConstants.NOTIFICATION_ROUTING_KEY,
				message
			);

			log.info("알림 메시지 발행 완료: userId={}, type={}, scheduledAt={}", message.userId(), message.type(), message.scheduledAt());
		} catch (Exception e) {
			log.error("알림 메시지 발행 실패: userId={}, error={}", message.userId(), e.getMessage(), e);
			throw new BaseException(ErrorCode.MESSAGE_QUEUE_ERROR);
		}
	}
}