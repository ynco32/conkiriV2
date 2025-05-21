package com.conkiri.domain.notification.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FCMService {

	/**
	 * FCM을 통한 푸시 알림 전송
	 */
	public boolean sendPushNotification(boolean isNotificationEnabled, String fcmToken, String title, String body, Map<String, String> data) {
		try {
			if (!isNotificationEnabled) {
				log.debug("사용자 알림 비활성화");
				return false;
			}
			if (fcmToken == null || fcmToken.isEmpty()) {
				log.warn("FCM 토큰이 없어 알림을 전송할 수 없습니다.");
				return false;
			}

			Message.Builder messageBuilder = Message.builder()
				.setToken(fcmToken)
				.setNotification(Notification.builder()
					.setTitle(title)
					.setBody(body)
					.build());

			// 추가 데이터가 있으면 포함
			if (data != null && !data.isEmpty()) {
				messageBuilder.putAllData(data);
			}

			Message message = messageBuilder.build();
			String response = FirebaseMessaging.getInstance().send(message);

			System.out.println(message.toString());
			log.info("FCM 메시지 전송 성공: messageId={}", response);
			return true;
		} catch (Exception e) {
			log.error("FCM 메시지 전송 실패: {}", e.getMessage(), e);
			return false;
		}
	}


}
