package com.conkiri.global.config.notification;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.conkiri.global.util.RabbitMQConstants;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@Profile({"rabbitmq-local", "rabbitmq-dev"})
public class RabbitMQConfig {

	/**
	 * 메인 알림 큐 설정
	 * 이 큐에 모든 알림 메시지가 들어가며, 처리에 실패하면 DLQ로 이동
	 */
	@Bean
	public Queue notificationQueue() {
		return QueueBuilder.durable(RabbitMQConstants.NOTIFICATION_QUEUE)  // 큐 이름 설정, durable = 서버 재시작해도 큐 유지
			.deadLetterExchange(RabbitMQConstants.DLQ_EXCHANGE)  // 처리 실패 시 메시지가 이동할 Exchange
			.deadLetterRoutingKey(RabbitMQConstants.DLQ_ROUTING_KEY)  // DLQ로 라우팅할 때 사용할 키
			.ttl(86400000)  // 메시지 만료 시간 = 24시간 (1일), 이 시간 후 자동 삭제
			.build();
	}

	/**
	 * Dead Letter Queue (DLQ) 설정
	 * 메인 큐에서 처리 실패한 메시지들이 저장되는 곳
	 * 나중에 수동으로 재처리하거나 원인 분석에 사용
	 */
	@Bean
	public Queue deadLetterQueue() {
		return QueueBuilder
			.durable(RabbitMQConstants.DLQ)  // DLQ 이름 설정
			.build();
	}

	/**
	 * 알림용 Exchange 설정
	 * Exchange는 메시지를 받아서 라우팅 키에 따라 적절한 큐로 전달하는 역할
	 * TopicExchange는 라우팅 키 패턴 매칭을 지원
	 */
	@Bean
	public TopicExchange notificationExchange() {
		return new TopicExchange(RabbitMQConstants.NOTIFICATION_EXCHANGE);
	}

	/**
	 * Dead Letter Exchange 설정
	 * 처리 실패한 메시지들을 DLQ로 라우팅하는 역할
	 */
	@Bean
	public TopicExchange deadLetterExchange() {
		return new TopicExchange(RabbitMQConstants.DLQ_EXCHANGE);
	}

	/**
	 * Exchange와 Queue를 연결하는 바인딩 설정
	 * notificationExchange로 들어온 메시지 중에서
	 * NOTIFICATION_ROUTING_KEY를 가진 메시지를 notificationQueue로 전달
	 */
	@Bean
	public Binding notificationBinding(Queue notificationQueue, TopicExchange notificationExchange) {
		return BindingBuilder
			.bind(notificationQueue)
			.to(notificationExchange)
			.with(RabbitMQConstants.NOTIFICATION_ROUTING_KEY);
	}

	/**
	 * DLQ 바인딩 설정
	 * deadLetterExchange로 들어온 메시지 중에서
	 * DLQ_ROUTING_KEY 라우팅 키를 가진 메시지를 DLQ로 전달
	 */
	@Bean
	public Binding deadLetterBinding(Queue deadLetterQueue, TopicExchange deadLetterExchange) {
		return BindingBuilder
			.bind(deadLetterQueue)
			.to(deadLetterExchange)
			.with(RabbitMQConstants.DLQ_ROUTING_KEY);
	}

	/**
	 * JSON 메시지 컨버터 설정
	 * Java 객체를 JSON으로, JSON을 Java 객체로 자동 변환
	 * NotificationMessage 같은 객체를 직접 보내고 받을 수 있게 해줌
	 */
	@Bean
	public Jackson2JsonMessageConverter messageConverter() {
		return new Jackson2JsonMessageConverter();
	}

	/**
	 * RabbitTemplate 설정
	 * 실제 메시지를 RabbitMQ로 전송할 때 사용하는 클래스
	 * Producer가 이 템플릿을 사용해서 메시지를 발행
	 */
	@Bean
	public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
		RabbitTemplate template = new RabbitTemplate(connectionFactory);

		// 객체를 자동으로 JSON으로 변환
		template.setMessageConverter(messageConverter());
		// Publisher Confirms 활성화 (메시지 전송 보장)
		template.setMandatory(true);

		// 메시지가 라우팅되지 않았을 때 콜백
		template.setReturnsCallback(returnedMessage -> {
			log.error("메시지 라우팅 실패: message={}, replyCode={}, replyText={}",
				returnedMessage.getMessage(),
				returnedMessage.getReplyCode(),
				returnedMessage.getReplyText());
		});

		template.setConfirmCallback((correlationData, ack, cause) -> {
			if (!ack) {
				log.error("메시지 전송 실패: correlationData={}, cause={}", correlationData, cause);
			}
		});

		return template;
	}
}