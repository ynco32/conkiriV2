package com.conkiri.global.util;

public class RabbitMQConstants {

	private RabbitMQConstants() {}

	// 큐 이름 상수
	public static final String NOTIFICATION_QUEUE = "notification.queue";
	public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
	public static final String NOTIFICATION_ROUTING_KEY = "notification.routing.key";

	// Dead Letter Queue 설정
	public static final String DLQ = "notification.dlq";
	public static final String DLQ_EXCHANGE = "notification.dlx";
	public static final String DLQ_ROUTING_KEY = "notification.dlq.routing.key";
}
