package com.conkiri.domain.ticketing.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.conkiri.domain.ticketing.dto.response.SeatDetailResponseDTO;
import com.conkiri.domain.ticketing.dto.response.SeatResponseDTO;
import com.conkiri.domain.ticketing.dto.response.TicketingResultResponseDTO;
import com.conkiri.domain.ticketing.entity.Result;
import com.conkiri.domain.ticketing.entity.Section;
import com.conkiri.domain.ticketing.entity.Status;
import com.conkiri.domain.ticketing.repository.ResultRepository;
import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.service.UserReadService;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.RedisKeys;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class TicketingService {

	private static final int MAX_ROW = 7;
	private static final int MAX_COL = 10;
	private final RedisTemplate<String, String> redisTemplate;
	private final UserReadService userReadService;
	private final ResultRepository resultRepository;

	// 특정 구역의 모든 좌석을 초기화
	public void initializeSeatsForSection(String section) {

		validateSection(section);
		String sectionKey = RedisKeys.getSectionKey(section);
		initializeAllSeatsInSection(sectionKey);
	}

	// 모든 좌석을 Available 상태로 초기화
	private void initializeAllSeatsInSection(String sectionKey) {

		for (int row = 1; row <= MAX_ROW; row++) {
			for (int col = 1; col <= MAX_COL; col++) {
				String seat = formatSeatNumber(row, col);
				redisTemplate.opsForHash().put(sectionKey, seat, Status.AVAILABLE.getValue());
			}
		}
	}

	// 특정 구역의 좌석 상태 조회
	public SeatResponseDTO getSeatsForSection(String section) {

		validateSection(section);
		Map<Object, Object> entries = redisTemplate.opsForHash().entries(RedisKeys.getSectionKey(section));
		List<SeatDetailResponseDTO> seatDetails = entries.entrySet().stream()
			.map(entry -> new SeatDetailResponseDTO(
				entry.getKey().toString(),
				entry.getValue().toString()
			))
			.toList();

		return SeatResponseDTO.from(seatDetails);
	}

	/*
		좌석 예약
	 	1. request 유효성 검증
	 	2. 좌석 락 획득
	 	3. 좌석 유효성 검증
	 	4. 좌석 예매
	 	5. 좌석 락 해제
	*/
	public void reserveSeat(Long userId, String section, String seat) {

		validateReservationRequest(userId, section, seat);
		String lockKey = RedisKeys.getSeatLockKey(section, seat);


		try {
			acquireLock(lockKey);
			String sectionKey = RedisKeys.getSectionKey(section);
			validateSeatAvailability(sectionKey, seat);
			processSeatReservation(userId, section, seat, sectionKey);
		} finally {
			releaseLock(lockKey);
		}
	}

	// 좌석에 대한 락 획득
	private void acquireLock(String lockKey) {

		Boolean acquired = redisTemplate.opsForValue()
			.setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(3));

		if (acquired == null || !acquired) {
			throw new BaseException(ErrorCode.ALREADY_RESERVED_SEAT);
		}
	}

	/*
	  실제 좌석 예매 처리
	  1. 좌석 상태를 Reserved 로 변경
	  2. 예매 히스토리 저장
	*/
	private void processSeatReservation(Long userId, String section, String seat, String sectionKey) {

		String historyKey = RedisKeys.getUserHistoryKey(userId);
		redisTemplate.opsForHash().put(sectionKey, seat, Status.RESERVED.getValue());
		saveReservationHistory(historyKey, userId, section, seat);
	}

	// 예매 정보 저장
	private void saveReservationHistory(String userHistoryKey, Long userId, String section, String seat) {
		LocalDateTime now = LocalDateTime.now();

		// 사용자의 예매 내역 저장
		redisTemplate.opsForHash().put(userHistoryKey, "section", section);
		redisTemplate.opsForHash().put(userHistoryKey, "seat", seat);
		redisTemplate.opsForHash().put(userHistoryKey, "reserveTime", now.toString());

		// 해당 좌석의 예매 내역 저장
		String seatHistoryKey = RedisKeys.getSeatHistoryKey(section, seat);
		redisTemplate.opsForHash().put(seatHistoryKey, "userId", String.valueOf(userId));
		redisTemplate.opsForHash().put(seatHistoryKey, "reserveTime", now.toString());
	}

	// 예매 취소
	public void deleteTicketingResult(Long userId) {
		String userHistoryKey = RedisKeys.getUserHistoryKey(userId);
		String section = (String) redisTemplate.opsForHash().get(userHistoryKey, "section");
		String seat = (String) redisTemplate.opsForHash().get(userHistoryKey, "seat");
		if (section != null && seat != null) {
			String sectionKey = RedisKeys.getSectionKey(section);
			redisTemplate.opsForHash().put(sectionKey, seat, Status.AVAILABLE.getValue());

			String seatHistoryKey = RedisKeys.getSeatHistoryKey(section, seat);
			redisTemplate.delete(seatHistoryKey);
		}

		redisTemplate.opsForHash().delete(userHistoryKey, "reserveTime");
		redisTemplate.opsForHash().delete(userHistoryKey, "section");
		redisTemplate.opsForHash().delete(userHistoryKey, "seat");
	}

	// 티켓팅 결과 조회
	public TicketingResultResponseDTO getTicketingResult(Long userId) {
		String historyKey = RedisKeys.getUserHistoryKey(userId);
		Map<Object, Object> history = redisTemplate.opsForHash().entries(historyKey);
		if (history.isEmpty()) {
			throw new BaseException(ErrorCode.RECORD_NOT_FOUND);
		}

		String section = (String) history.get("section");
		String seat = (String) history.get("seat");
		LocalDateTime reserveTime = LocalDateTime.parse((String) history.get("reserveTime"));
		String concertName = (String)redisTemplate.opsForHash().get(RedisKeys.TIME, "concertName");
		String ticketingPlatform = (String)redisTemplate.opsForHash().get(RedisKeys.TIME, "ticketingPlatform");
		return TicketingResultResponseDTO.of(concertName, ticketingPlatform, section, seat, reserveTime);
	}

	// 결과 저장
	public void saveTicketingResult(Long userId) {

		TicketingResultResponseDTO resultDTO = getTicketingResult(userId);
		User user = userReadService.findUserByIdOrElseThrow(userId);
		Result result = Result.of(resultDTO, user);
		resultRepository.save(result);
	}

	// 마이페이지용 전체 결과 조회
	public List<TicketingResultResponseDTO> getAllTicketingResults(User user) {
		return resultRepository.findByUserOrderByReserveTimeDesc(user)
			.stream()
			.map(result -> TicketingResultResponseDTO.of(
				result.getConcertName(),
				result.getTicketingPlatform(),
				result.getSection(),
				result.getSeat(),
				result.getReserveTime()
			))
			.toList();
	}

	/*
		유효성 검사
	*/

	//  좌석 상태 유효성 검사
	private void validateSeatAvailability(String sectionKey, String seat) {

		String currentStatus = (String)redisTemplate.opsForHash().get(sectionKey, seat);
		if (!Status.AVAILABLE.getValue().equals(currentStatus)) {
			throw new BaseException(ErrorCode.ALREADY_RESERVED_SEAT);
		}
	}

	// 예약 요청에 대한 전반적인 유효성 검사
	private void validateReservationRequest(Long userId, String section, String seat) {

		validateSection(section);
		validateSeat(seat);
		validateNoExistingReservation(userId);
	}

	// 구역 검사
	public void validateSection(String section) {

		if (!Section.isValidSection(section)) {
			throw new BaseException(ErrorCode.INVALID_SECTION);
		}
	}

	// 좌석 검사
	public void validateSeat(String seat) {

		try {
			if (seat == null || !seat.matches("\\d+-\\d+")) {
				throw new BaseException(ErrorCode.INVALID_SEAT);
			}

			String[] parts = seat.split("-");
			int row = Integer.parseInt(parts[0]);
			int col = Integer.parseInt(parts[1]);

			if (row < 1 || row > MAX_ROW || col < 1 || col > MAX_COL) {
				throw new BaseException(ErrorCode.INVALID_SEAT);
			}
		} catch (NumberFormatException e) {
			throw new BaseException(ErrorCode.INVALID_SEAT);
		}
	}

	// 중복 예매 검사
	private void validateNoExistingReservation(Long userId) {

		String userHistoryKey = RedisKeys.getUserHistoryKey(userId);
		Boolean hasReservation = redisTemplate.opsForHash().hasKey(userHistoryKey, "reserveTime");

		if (Boolean.TRUE.equals(hasReservation)) {
			log.info("User {} already has a reservation", userId);
			throw new BaseException(ErrorCode.DUPLICATE_TICKETING);
		}
	}

	/*
		유틸 메서드
	*/
	private String formatSeatNumber(int row, int col) {
		return row + "-" + col;
	}

	private void releaseLock(String lockKey) {
		redisTemplate.delete(lockKey);
	}

}
