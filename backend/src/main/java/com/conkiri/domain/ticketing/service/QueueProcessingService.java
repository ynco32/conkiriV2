package com.conkiri.domain.ticketing.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Set;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.ticketing.dto.response.ServerMetricsDTO;
import com.conkiri.domain.ticketing.dto.response.WaitingTimeResponseDTO;
import com.conkiri.domain.user.service.UserReadService;
import com.conkiri.global.common.ApiResponse;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.RedisKeys;
import com.conkiri.global.util.WebSocketConstants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class QueueProcessingService {

	private final RedisTemplate<String, String> redisTemplate;
	private final SimpMessagingTemplate messagingTemplate;
	private final ServerMonitorService serverMonitorService;
	private final UserReadService userReadService;

	// 티켓팅 시작 및 종료 시간을 Redis 에 설정합니다
	public void setTicketingTime(LocalDateTime startTime, LocalDateTime endTime, Concert concert) {

		log.info("티켓팅 시간 설정 - 시작: {}, 종료: {}", startTime, endTime);
		redisTemplate.opsForHash().put(RedisKeys.TIME, "startTime", startTime.toString());
		redisTemplate.opsForHash().put(RedisKeys.TIME, "endTime", endTime.toString());
		redisTemplate.opsForHash().put(RedisKeys.TIME, "ticketingPlatform", concert.getTicketingPlatform().name());

		String dummyId = "dummy_user";
		double dummyScore = Double.MIN_VALUE;
		redisTemplate.opsForZSet().add(RedisKeys.QUEUE, dummyId, dummyScore);
	}

	// 현재 시간이 티켓팅 가능 시간 범위 내인지 확인합니다.
	public boolean isTicketingActive() {

		String startTimeStr = (String)redisTemplate.opsForHash().get(RedisKeys.TIME, "startTime");
		String endTimeStr = (String)redisTemplate.opsForHash().get(RedisKeys.TIME, "endTime");
		if (startTimeStr == null || endTimeStr == null)
			return false;

		LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
		LocalDateTime startTime = LocalDateTime.parse(startTimeStr);
		LocalDateTime endTime = LocalDateTime.parse(endTimeStr);
		return now.isAfter(startTime) && now.isBefore(endTime);
	}

	// 사용자를 대기열에 추가
	public String addToQueue(Long userId, String sessionId) {

		validateQueueRequest();

		double score = System.nanoTime();
		String queueKey = userId + "_" + sessionId;
		redisTemplate.opsForZSet().add(RedisKeys.QUEUE, queueKey, score);
		redisTemplate.opsForHash().put(RedisKeys.SESSION_MAP, sessionId, String.valueOf(userId));

		WaitingTimeResponseDTO waitingTimeResponseDTO = getEstimatedWaitingTime(sessionId);
		return notifyWaitingTime(userId, sessionId, waitingTimeResponseDTO);
	}

	// 실시간 대기번호 예상시간 알림
	private String notifyWaitingTime(Long userId, String sessionId, WaitingTimeResponseDTO waitingTime) {

		log.info("Sending waiting time to user {}, {}, {}, {}", userId, waitingTime.estimatedWaitingSeconds(),
			waitingTime.usersAfter(), waitingTime.position());

		log.info(ApiResponse.success(waitingTime).toString());


		messagingTemplate.convertAndSendToUser(
			userId + "_" + sessionId,
			WebSocketConstants.WAITING_TIME_DESTINATION,
			ApiResponse.success(waitingTime)
		);
		return userId + "_" + sessionId;
	}

	// 서버 부하에 따라 대기열을 주기적으로 처리합니다.
	@Scheduled(fixedRate = 5000)
	public void processWaitingQueue() {

		if (!isTicketingActive()) {
			return;
		}
		ServerMetricsDTO serverLoad = serverMonitorService.getCurrentServerLoad();
		int batchSize = serverMonitorService.calculateBatchSize(serverLoad);
		processNextBatch(batchSize);
	}

	// 지정된 배치 크기만큼 대기열에서 사용자를 처리합니다.
	private void processNextBatch(int batchSize) {

		if (isQueueEmpty()) {
			return;
		}
		Set<String> nextBatch = fetchNextBatch(batchSize);
		if (!nextBatch.isEmpty()) {
			processUsersEntrance(nextBatch);
			updateWaitingTimes();
		}
	}

	// 대기열이 비어있는지 확인합니다.
	private boolean isQueueEmpty() {

		return redisTemplate.opsForZSet().size(RedisKeys.QUEUE) == 0;
	}

	// 다음 처리할 배치의 사용자들을 조회합니다.
	private Set<String> fetchNextBatch(int batchSize) {

		Set<String> result = redisTemplate.opsForZSet().range(RedisKeys.QUEUE, 1, batchSize);
		return result != null ? result : Collections.emptySet();
	}

	// 배치의 사용자들을 입장 처리합니다
	private void processUsersEntrance(Set<String> queueKeys) {

		queueKeys.forEach(queueKey -> {
			if (!queueKey.equals("dummy_user")) {  // 더미 유저 체크 필요
				String[] parts = queueKey.split("_");
				Long userId = Long.parseLong(parts[0]);
				String sessionId = parts[1];
				log.info("Sending entrance notification to user: {}", userId);  // 로그 추가
				log.info(ApiResponse.success(true).toString());
				messagingTemplate.convertAndSendToUser(
					userId + "_" + sessionId,
					WebSocketConstants.NOTIFICATION_DESTINATION,
					ApiResponse.success(true)
				);
			}
		});
		removeProcessedUsersFromQueue(queueKeys.size());
	}

	// 처리 완료된 사용자들을 대기열에서 제거합니다, batchSize = 제거할 배치 크기
	private void removeProcessedUsersFromQueue(int batchSize) {

		redisTemplate.opsForZSet().removeRange(RedisKeys.QUEUE, 1, batchSize);
	}

	// 모든 대기 중인 사용자들의 대기 시간을 업데이트합니다.
	private void updateWaitingTimes() {

		Set<String> waitingUsers = getAllWaitingUsers();
		waitingUsers.forEach(this::updateUserWaitingTime);
	}

	// 현재 대기 중인 모든 사용자를 조회합니다.
	private Set<String> getAllWaitingUsers() {

		Set<String> result = redisTemplate.opsForZSet().range(RedisKeys.QUEUE, 1, -1);
		return result != null ? result : Collections.emptySet();
	}

	// 개별 사용자의 대기 시간을 업데이트합니다.
	private void updateUserWaitingTime(String queueKey) {

		String[] parts = queueKey.split("_");
		if (parts.length != 2) return;
		Long userId = Long.parseLong(parts[0]);
		String sessionId = parts[1];

		WaitingTimeResponseDTO waitingTime = getEstimatedWaitingTime(sessionId);
		if (waitingTime != null) {
			notifyWaitingTime(userId, sessionId, waitingTime);
		}
	}

	public WaitingTimeResponseDTO getEstimatedWaitingTime(String sessionId) {

		String userId = (String) redisTemplate.opsForHash().get(RedisKeys.SESSION_MAP, sessionId);
		if (userId == null) {
			return WaitingTimeResponseDTO.of(0L, 0L, 0L);
		}

		String queueKey = userId + "_" + sessionId;
		Long position = redisTemplate.opsForZSet().rank(RedisKeys.QUEUE, queueKey);
		if (position == null) {
			return WaitingTimeResponseDTO.of(0L, 0L, 0L);
		}

		ServerMetricsDTO serverLoad = serverMonitorService.getCurrentServerLoad();
		int batchSize = serverMonitorService.calculateBatchSize(serverLoad);

		// 대기번호는 1부터 시작
		Long waitingNumber = position;
		Long usersAhead = position - 1;

		// 대기 시간 계산 (5초 주기, 배치 크기 고려)
		// 자신의 순서가 처리될 배치 번호 계산 (올림)
		Long myBatchNumber = (usersAhead + batchSize - 1) / batchSize;
		// 배치 번호 * 5초
		Long estimatedSeconds = myBatchNumber * 5L;

		Long totalWaiting = redisTemplate.opsForZSet().size(RedisKeys.QUEUE) - 1;
		Long usersAfter = Math.max(0L, totalWaiting - waitingNumber);

		return WaitingTimeResponseDTO.of(waitingNumber, estimatedSeconds, usersAfter);
	}

	// 대기열 참여 요청의 유효성을 검증합니다.
	public void validateQueueRequest() {

		if (!isTicketingActive()) {
			throw new BaseException(ErrorCode.NOT_START_TICKETING);
		}
	}
}
