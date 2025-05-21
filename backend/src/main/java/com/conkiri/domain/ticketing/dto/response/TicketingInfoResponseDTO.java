package com.conkiri.domain.ticketing.dto.response;

import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.data.redis.core.RedisTemplate;

import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.RedisKeys;

public record TicketingInfoResponseDTO(
	LocalDateTime startTime,
	LocalDateTime serverTime,
	boolean isWithin10Minutes,
	boolean isFinished,
	String concertName,
	String ticketingPlatform,
	String photoUrl
) {

	public static TicketingInfoResponseDTO from(RedisTemplate<String, String> redisTemplate) {

		LocalDateTime serverTime = LocalDateTime.now(ZoneId.of("Asia/Seoul"));

		String startTimeStr = (String)redisTemplate.opsForHash().get(RedisKeys.TIME, "startTime");
		String endTimeStr = (String)redisTemplate.opsForHash().get(RedisKeys.TIME, "endTime");
		String concertName = (String)redisTemplate.opsForHash().get(RedisKeys.TIME, "concertName");
		String ticketingPlatform = (String)redisTemplate.opsForHash().get(RedisKeys.TIME, "ticketingPlatform");
		String photoUrl = (String)redisTemplate.opsForHash().get(RedisKeys.TIME, "photoUrl");

		if (startTimeStr == null || endTimeStr == null) {
			throw new BaseException(ErrorCode.NO_TICKETING_TODAY);
		}
		LocalDateTime startTime = LocalDateTime.parse(startTimeStr);
		LocalDateTime endTime = LocalDateTime.parse(endTimeStr);

		boolean isWithin10Minutes = serverTime.isAfter(startTime.minusMinutes(10))
			&& serverTime.isBefore(startTime);
		boolean isFinished = serverTime.isAfter(endTime);

		return new TicketingInfoResponseDTO(
			startTime,
			serverTime,
			isWithin10Minutes,
			isFinished,
			concertName,
			ticketingPlatform,
			photoUrl
		);
	}
}
