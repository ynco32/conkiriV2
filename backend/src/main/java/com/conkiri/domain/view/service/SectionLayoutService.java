package com.conkiri.domain.view.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.view.dto.response.RowDTO;
import com.conkiri.domain.view.dto.response.SeatDTO;
import com.conkiri.domain.view.dto.response.SectionSeatsResponseDTO;
import com.conkiri.domain.view.entity.Seat;
import com.conkiri.domain.view.entity.SectionLayout;
import com.conkiri.domain.view.repository.ReviewRepository;
import com.conkiri.domain.view.repository.SeatRepository;
import com.conkiri.domain.view.repository.SectionLayoutRepository;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class SectionLayoutService {

	private final SectionLayoutRepository sectionLayoutRepository;
	private final SeatRepository seatRepository;
	private final ReviewRepository reviewRepository;
	private final ObjectMapper objectMapper;

	public SectionSeatsResponseDTO getSectionSeats(Long arenaId, String section) {

		// 1. 해당 구역의 좌석 배치도 불러오기 : SectionLayout
		SectionLayout layout = findSectionLayout(arenaId, section);
		// 2. 해당 구역의 실제 좌석 목록 불러오기 : Seat
		List<Seat> seats = findSeats(arenaId, section);
		// 3. 위 좌석 중 후기가 존재하는 좌석 ID 목록 찾기
		Set<Long> reviewedSeatIds = findReviewedSeatIds(seats);

		// 4. 각 좌석에 대한 Key를 만들어서, '좌석-Key'로 연결
		// 실제 좌석이 행이 A, 열이 5이라면 Key는 A-5
		// 실제 Seat를 빠르게 찾아서 배치용 Layout Seat에 연결하기 위함
		Map<String, Seat> seatMap = seats.stream()
			.collect(Collectors.toMap(this::getSeatKey, seat -> seat));

		// 5. Layout Seat에 있는 배치 데이터(JSON)를 파싱하면서 + 실제 좌석, 리뷰 여부와 연결
		List<RowDTO> rowDTOs = parseLayout(layout.getLayoutData(), seatMap, reviewedSeatIds);

		return new SectionSeatsResponseDTO(section, rowDTOs);
	}

	// 1
	private SectionLayout findSectionLayout(Long arenaId, String section) {
		return sectionLayoutRepository.findByArena_ArenaIdAndSection(arenaId, section)
			.orElseThrow(() -> new BaseException(ErrorCode.ENTITY_NOT_FOUND));
	}

	// 2
	private List<Seat> findSeats(Long arenaId, String section) {
		return seatRepository.findByArena_ArenaIdAndSection(arenaId, section);
	}

	// 3
	private Set<Long> findReviewedSeatIds(List<Seat> seats) {
		List<Long> seatIds = seats.stream()
			.map(Seat::getSeatId)
			.toList();
		return new HashSet<>(reviewRepository.findSeatIdsWithReviews(seatIds));
	}

	// 5-1. 전체 좌석표 JSON을 파싱해서 줄(row) 단위로 나눔
	private List<RowDTO> parseLayout(String layoutData, Map<String, Seat> seatMap, Set<Long> reviewedSeatIds) {
		try {
			JsonNode seatMapNode = objectMapper.readTree(layoutData).path("seatMap");

			List<RowDTO> rowDTOs = new ArrayList<>();
			for (JsonNode rowNode : seatMapNode) {
				rowDTOs.add(parseRow(rowNode, seatMap, reviewedSeatIds));
			}

			return rowDTOs;
		} catch (Exception e) {
			throw new BaseException(ErrorCode.JSON_DATA_ERROR);
		}
	}

	// 5-2. 한 줄(row)의 좌석들을 순회하면서 SeatDTO를 모아서 RowDTO로 만듦
	private RowDTO parseRow(JsonNode rowNode, Map<String, Seat> seatMap, Set<Long> reviewedSeatIds) {
		String rowName = rowNode.path("row").asText();

		List<SeatDTO> seatDTOs = new ArrayList<>();
		for (JsonNode seatNode : rowNode.path("activeSeats")) {
			int seatNumber = seatNode.path("seat").asInt();
			seatDTOs.add(createSeatDTO(rowName, seatNumber, seatMap, reviewedSeatIds));
		}

		return new RowDTO(rowName, seatDTOs);
	}

	//5-3. 각 좌석 하나하나에 대해 실제 seatId, 후기 여부 정보를 붙여서 SeatDTO 생성
	private SeatDTO createSeatDTO(String rowName, int seatNumber, Map<String, Seat> seatMap, Set<Long> reviewedSeatIds) {
		if (seatNumber == 0) {
			return new SeatDTO(0, null, false);
		}

		String key = rowName + "-" + seatNumber;
		Seat seat = seatMap.get(key);

		if (seat == null) {
			return new SeatDTO(seatNumber, null, false);
		}

		boolean hasReview = reviewedSeatIds.contains(seat.getSeatId());
		return new SeatDTO(seatNumber, seat.getSeatId(), hasReview);
	}

	// 4-1
	private String getSeatKey(Seat seat) {
		return seat.getRowLine() + "-" + seat.getColumnLine();
	}
}

// CREATE INDEX idx_review_seat_id ON review(seat_id);