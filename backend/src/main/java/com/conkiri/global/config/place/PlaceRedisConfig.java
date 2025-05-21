package com.conkiri.global.config.place;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class PlaceRedisConfig {

	@Bean(name = "chatRedisTemplate")
	public RedisTemplate<String, Object> chatRedisTemplate(RedisConnectionFactory connectionFactory) {
		RedisTemplate<String, Object> template = new RedisTemplate<>();
		template.setConnectionFactory(connectionFactory);

		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.registerModule(new JavaTimeModule());
		objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

		GenericJackson2JsonRedisSerializer serializer =
			new GenericJackson2JsonRedisSerializer(objectMapper);

		// Key/Value 직렬화 방식 설정
		template.setKeySerializer(new StringRedisSerializer());
		template.setValueSerializer(serializer);
		template.setHashKeySerializer(new StringRedisSerializer());
		template.setHashValueSerializer(serializer);

		return template;
	}
}
