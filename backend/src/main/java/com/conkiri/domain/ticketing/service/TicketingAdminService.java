package com.conkiri.domain.ticketing.service;

import java.time.LocalDateTime;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.ticketing.dto.request.TicketingTimeRequestDTO;
import com.conkiri.domain.ticketing.entity.Section;
import com.conkiri.global.util.RedisKeys;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class TicketingAdminService {

	private final RedisTemplate<String, String> redisTemplate;
	private final TicketingService ticketingService;

	// 시간 설정
	public void setTime(TicketingTimeRequestDTO dto){
		log.info("티켓팅 시간 설정 - 시작: {}, 종료: {}", dto.startTime(), dto.endTime());
		redisTemplate.opsForHash().put(RedisKeys.TIME, "concertName", dto.concertName());
		redisTemplate.opsForHash().put(RedisKeys.TIME, "startTime", dto.startTime().toString());
		redisTemplate.opsForHash().put(RedisKeys.TIME, "endTime", dto.endTime().toString());
		redisTemplate.opsForHash().put(RedisKeys.TIME, "ticketingPlatform", dto.ticketingPlatform());

		Section.getSections().forEach(ticketingService::initializeSeatsForSection);
		String dummyId = "dummy_user";
		double dummyScore = Double.MIN_VALUE;
		redisTemplate.opsForZSet().add(RedisKeys.QUEUE, dummyId, dummyScore);
	}

	// 비활성화
	public void deActiveTicketing(){
		LocalDateTime now = LocalDateTime.now();
		String concertName = (String)redisTemplate.opsForHash().get(RedisKeys.TIME, "concertName");
		log.info("콘서트 [{}]의 티켓팅을 비활성화합니다", concertName);

		redisTemplate.opsForHash().put(RedisKeys.TIME, "endTime", now.toString());
		log.info("티켓팅이 비활성화되었습니다");
	}
}
