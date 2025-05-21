package com.conkiri.global.scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.repository.ConcertRepository;
import com.conkiri.domain.ticketing.entity.Section;
import com.conkiri.domain.ticketing.service.QueueProcessingService;
import com.conkiri.domain.ticketing.service.TicketingService;
import com.conkiri.global.util.RedisKeys;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class TicketingScheduler {

	private static final int TICKETING_DURATION_HOURS = 10;
	private static final String TICKETING_KEY_PATTERN = "ticketing:*";

	private final RedisTemplate<String, String> redisTemplate;
	private final TicketingService ticketingService;
	private final QueueProcessingService queueProcessingService;
	private final ThreadPoolTaskScheduler taskScheduler;
	private final ConcertRepository concertRepository;


	// 애플리케이션 시작 시 티켓팅 초기화
	@EventListener(ApplicationReadyEvent.class)
	public void onApplicationReady() {
		log.info("서버 재시작");
		scheduleTodayConcertTicketing();
	}

	// 매일 자정에 실행되어 그 날의 티켓팅 일정을 확인하고 스케줄링
	@Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
	public void scheduleTodayConcertTicketing() {
		log.info("오늘의 티켓팅 일정 확인");
		List<Concert> todayConcerts = concertRepository.findConcertsWithTicketingToday();

		if (todayConcerts.isEmpty()) {
			log.info("오늘 예정된 티켓팅이 없습니다.");
			return;
		}

		Concert selectedConcert = todayConcerts.get(0);
		log.info("오늘 티켓팅 예정 콘서트 {}개 중 규모가 가장 큰 [{}] 선택됨",
			todayConcerts.size(), selectedConcert.getConcertName());

		if (todayConcerts.size() > 1) {
			for (int i = 1; i < todayConcerts.size(); i++) {
				Concert skippedConcert = todayConcerts.get(i);
				log.info("콘서트 [{}]: 오늘 다른 콘서트가 선택되어 건너뜀", skippedConcert.getConcertName());
			}
		}

		scheduleConcertTicketing(selectedConcert);
	}

	// 특정 콘서트 티켓팅 스케줄링
	private void scheduleConcertTicketing(Concert concert) {
		LocalDateTime ticketingTime = getTicketingTimeForToday(concert);
		if (ticketingTime == null) {
			log.warn("콘서트 [{}]: 오늘 티켓팅 없음", concert.getConcertName());
			return;
		}

		LocalDateTime endTime = ticketingTime.plusHours(TICKETING_DURATION_HOURS);
		queueProcessingService.setTicketingTime(ticketingTime, endTime, concert);
		Section.getSections().forEach(ticketingService::initializeSeatsForSection);
		log.info("콘서트 [{}] 티켓팅 초기화 완료: {} ~ {} (플랫폼: {})",
			concert.getConcertName(), ticketingTime, endTime, concert.getTicketingPlatform().getDisplayName());
	}

	// 티켓팅 시간 계산: 오늘이 사전/일반 예매일이면 1시간 전 반환
	private LocalDateTime getTicketingTimeForToday(Concert concert) {
		LocalDate today = LocalDate.now();

		if (concert.getAdvancedReservation() != null &&
			concert.getAdvancedReservation().toLocalDate().equals(today)) {
			log.info("콘서트 [{}]: 사전 예매 시간 감지", concert.getConcertName());
			redisTemplate.opsForHash().put(RedisKeys.TIME, "concertName", concert.getConcertName() + " 선예매");
			redisTemplate.opsForHash().put(RedisKeys.TIME, "photoUrl", concert.getPhotoUrl());
			return concert.getAdvancedReservation().minusHours(1);
		}

		if (concert.getReservation() != null &&
			concert.getReservation().toLocalDate().equals(today)) {
			log.info("콘서트 [{}]: 일반 예매 시간 감지", concert.getConcertName());
			redisTemplate.opsForHash().put(RedisKeys.TIME, "concertName", concert.getConcertName() + " 일반예매");
			redisTemplate.opsForHash().put(RedisKeys.TIME, "photoUrl", concert.getPhotoUrl());
			return concert.getReservation().minusHours(1);
		}

		return null;
	}

	// 매일 23시 30분에 티켓팅 데이터 정리
	@Scheduled(cron = "0 30 23 * * *", zone = "Asia/Seoul")
	public void clearTicketingData() {
		Set<String> keys = redisTemplate.keys(TICKETING_KEY_PATTERN);
		if (keys != null && !keys.isEmpty()) {
			redisTemplate.delete(keys);
			log.info("하루 종료 시점 티켓팅 데이터 정리 완료");
		}
	}
}





