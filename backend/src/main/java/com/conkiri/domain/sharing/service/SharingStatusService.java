package com.conkiri.domain.sharing.service;

import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.repository.ConcertRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SharingStatusService {

	private final ConcertRepository concertRepository;
	private final SharingService sharingService;
	private final ThreadPoolTaskScheduler taskScheduler;

	/**
	 * Concert의 startTime을 기준으로 Sharing의 status를 CLOSED로 전환
	 * 매일 00:30에 그날의 Concert에 대해 관련 작업을 예약
	 */
	//@Scheduled(cron = "0 50 9 * * *")
	@Transactional
	public void scheduleConcertBasedStatusUpdates() {

		// LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
		// LocalDateTime endOfDay = now.toLocalDate().atTime(23, 59, 59);
		//
		// // 오늘 시작되는 Concert 리스트 조회
		// List<Concert> concerts = concertRepository.findByStartTimeBetween(now, endOfDay);
		//
		// // 오늘 시작되는 콘서트들에 대해 시작시간이 되면 작업 수행
		// for (Concert concert : concerts) {
		// 	if (concert != null && concert.getConcertId() != null) {
		// 		scheduleSharingUpdateForConcert(concert, () -> sharingService.updateSharingStatusToCloesd(concert));
		// 	}
		// }
	}

	/**
	 * 특정 Concert의 startTime에 대한 Sharing 상태 업데이트 작업 예약
	 * @param concert
	 */
	@Transactional
	public void scheduleSharingUpdateForConcert(Concert concert, Runnable task) {

		// LocalDateTime startTime = concert.getStartTime();
		// Instant startTimeAsInstant = startTime.atZone(ZoneId.of("Asia/Seoul")).toInstant();
		//
		// taskScheduler.schedule(task, triggerContext -> {
		// 	Instant now = LocalDateTime.now().atZone(ZoneId.of("Asia/Seoul")).toInstant();
		// 	// 현재 시간이 정해진 시간보다 이후면 중단
		// 	if (now.isAfter(startTimeAsInstant)) { return null; }
		// 	// Trigger를 사용해서 지정된 시간에 실행
		// 	return Date.from(startTimeAsInstant).toInstant();
		// });
	}
}
