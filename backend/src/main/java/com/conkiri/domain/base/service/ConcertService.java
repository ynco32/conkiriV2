package com.conkiri.domain.base.service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.dto.request.ConcertListRequestDTO;
import com.conkiri.domain.base.dto.request.ConcertRequestDTO;
import com.conkiri.domain.base.dto.response.ConcertResponseDTO;
import com.conkiri.domain.base.entity.Arena;
import com.conkiri.domain.base.entity.Artist;
import com.conkiri.domain.base.entity.Cast;
import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.entity.ConcertDetail;
import com.conkiri.domain.base.entity.Platform;
import com.conkiri.domain.base.entity.VenueKeyword;
import com.conkiri.domain.base.repository.ArenaRepository;
import com.conkiri.domain.base.repository.ArtistRepository;
import com.conkiri.domain.base.repository.CastRepository;
import com.conkiri.domain.base.repository.ConcertDetailRepository;
import com.conkiri.domain.base.repository.ConcertRepository;
import com.conkiri.domain.chatbot.entity.ConcertNotice;
import com.conkiri.domain.chatbot.repository.ConcertNoticeRepository;
import com.conkiri.domain.notification.entity.MyConcert;
import com.conkiri.domain.notification.repository.MyConcertRepository;
import com.conkiri.domain.user.entity.User;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ConcertService {

	private final ConcertRepository concertRepository;
	private final MyConcertRepository myConcertRepository;
	private final ConcertDetailRepository concertDetailRepository;
	private final ArtistRepository artistRepository;
	private final ArenaRepository arenaRepository;
	private final CastRepository castRepository;
	private final ConcertNoticeRepository concertNoticeRepository;

	public ConcertResponseDTO getConcerts(Long lastConcertDetailId, String searchWord, User user) {

		return concertRepository.findConcerts(lastConcertDetailId, searchWord, user);
	}

	public ConcertResponseDTO getMyConcerts(User user) {

		return concertRepository.findMyConcerts(user);
	}

	@Transactional
	public void setMyConcerts(ConcertListRequestDTO request, User user) {

		List<MyConcert> currentMyConcerts = myConcertRepository.findByUser(user);

		Map<Long, MyConcert> currentByDetailId = mapByConcertDetail(currentMyConcerts);
		Map<Long, MyConcert> currentByConcertId = mapByConcertOnly(currentMyConcerts);
		Set<Long> newDetailIds = extractIds(request.concertDetailIds());
		Set<Long> newConcertIds = extractIds(request.concertIds());

		List<ConcertDetail> details = getValidatedConcertDetails(newDetailIds);
		Set<Long> concertIdsCoveredByDetails = extractConcertIds(details);
		newConcertIds.removeAll(concertIdsCoveredByDetails);

		List<MyConcert> toDelete = determineMyConcertsToDelete(currentMyConcerts, newDetailIds, newConcertIds);
		List<MyConcert> toSave = buildUpdatedMyConcerts(details, newConcertIds, currentByDetailId, currentByConcertId, user);
		persistChanges(toDelete, toSave);
	}


	@Transactional
	public void deleteMyConcert(Long concertId, User user) {

		List<MyConcert> myConcerts = findMyConcertsOrElseThrow(concertId, user);
		myConcertRepository.deleteAll(myConcerts);
	}

	private List<MyConcert> findMyConcertsOrElseThrow(Long concertId, User user) {

		List<MyConcert> myConcerts = myConcertRepository.findByUserAndConcertId(user, concertId);
		if (myConcerts.isEmpty()) throw new BaseException(ErrorCode.MY_CONCERT_NOT_FOUND);
		return myConcerts;
	}

	private Map<Long, MyConcert> mapByConcertDetail(List<MyConcert> list) {

		return list.stream()
			.filter(mc -> mc.getConcertDetail() != null)
			.collect(Collectors.toMap(mc -> mc.getConcertDetail().getConcertDetailId(), mc -> mc, (v1, v2) -> v1));
	}

	private Map<Long, MyConcert> mapByConcertOnly(List<MyConcert> list) {

		return list.stream()
			.filter(mc -> mc.getConcertDetail() == null)
			.collect(Collectors.toMap(mc -> mc.getConcert().getConcertId(), mc -> mc, (v1, v2) -> v1));
	}

	private Set<Long> extractIds(List<Long> ids) {

		return ids != null ? new HashSet<>(ids) : Set.of();
	}

	private List<ConcertDetail> getValidatedConcertDetails(Set<Long> detailIds) {

		List<ConcertDetail> details = concertDetailRepository.findAllById(detailIds);
		if (details.size() != detailIds.size()) {
			throw new BaseException(ErrorCode.CONCERT_DETAIL_NOT_FOUND);
		}
		return details;
	}

	private Set<Long> extractConcertIds(List<ConcertDetail> details) {

		return details.stream()
			.map(d -> d.getConcert().getConcertId())
			.collect(Collectors.toSet());
	}

	private List<MyConcert> determineMyConcertsToDelete(List<MyConcert> currentList, Set<Long> newDetailIds, Set<Long> newConcertIds) {

		return currentList.stream()
			.filter(mc -> {
				if (mc.getConcertDetail() != null) {
					return !newDetailIds.contains(mc.getConcertDetail().getConcertDetailId());
				} else {
					return !newConcertIds.contains(mc.getConcert().getConcertId());
				}
			})
			.toList();
	}

	private List<MyConcert> buildUpdatedMyConcerts(List<ConcertDetail> details, Set<Long> newConcertIds, Map<Long, MyConcert> currentByDetailId, Map<Long, MyConcert> currentByConcertId, User user) {

		List<MyConcert> result = new ArrayList<>();

		for (ConcertDetail detail : details) {
			Long detailId = detail.getConcertDetailId();
			if (!currentByDetailId.containsKey(detailId)) {
				result.add(MyConcert.of(detail.getConcert(), user, detail, true, true));
			}
		}

		for (Long concertId : newConcertIds) {
			if (!currentByConcertId.containsKey(concertId)) {
				Concert concert = concertRepository.findById(concertId)
					.orElseThrow(() -> new BaseException(ErrorCode.CONCERT_NOT_FOUND));
				result.add(MyConcert.of(concert, user, true, false));
			}
		}

		return result;
	}

	private void persistChanges(List<MyConcert> toDelete, List<MyConcert> toSave) {

		if (!toDelete.isEmpty()) myConcertRepository.deleteAll(toDelete);
		if (!toSave.isEmpty()) myConcertRepository.saveAll(toSave);
	}

	public Long createConcert(ConcertRequestDTO dto) {
		log.info("콘서트 생성 요청: {}", dto.concertName());

		Arena arena = findMatchingArena(dto.venueName());
		Platform platform = determineTicketingPlatform(dto.ticketingPlatform());

		Concert concert = createAndSaveConcert(dto, arena, platform);

		saveArtistsForConcert(concert, dto.artists());

		saveConcertStartTimes(concert, dto.startTimes());

		saveConcertNotice(concert, dto);

		return concert.getConcertId();
	}

	private void saveConcertNotice(Concert concert, ConcertRequestDTO dto) {
		if ((dto.noticeImageUrl() != null && !dto.noticeImageUrl().isEmpty()) ||
			(dto.noticeText() != null && !dto.noticeText().isEmpty())) {

			ConcertNotice concertNotice = ConcertNotice.of(
				concert,
				dto.originalUrl(),
				dto.noticeText(),
				dto.noticeImageUrl()
			);

			concertNoticeRepository.save(concertNotice);
		} else {
			log.info("콘서트 공지사항 정보 없음: 콘서트 ID {}", concert.getConcertId());
		}
	}

	private Platform determineTicketingPlatform(String platformName) {
		if (platformName == null || platformName.isEmpty()) {
			return null;
		}

		try {
			return Platform.valueOf(platformName.toUpperCase());
		} catch (IllegalArgumentException e) {
			log.warn("유효하지 않은 티켓팅 플랫폼: {}", platformName);
			return null;
		}
	}


	private Concert createAndSaveConcert(ConcertRequestDTO dto, Arena arena, Platform platform) {
		Concert concert = Concert.of(
			arena,
			dto.concertName(),
			dto.advanceReservation(),
			dto.reservation(),
			platform,
			dto.photoUrl()
		);

		return concertRepository.save(concert);
	}

	private void saveArtistsForConcert(Concert concert, List<String> artistNames) {
		if (artistNames == null || artistNames.isEmpty()) {
			return;
		}

		artistNames.stream()
			.filter(name -> name != null && !name.trim().isEmpty())
			.map(this::findArtist)
				.filter(artist -> artist != null)
				.forEach(artist -> {
					Cast cast = Cast.of(concert, artist);
					castRepository.save(cast);
			});
	}

	private void saveConcertStartTimes(Concert concert, List<LocalDateTime> startTimes) {
		if (startTimes == null || startTimes.isEmpty()) {
			log.info("시작 시간 정보 없음");
			return;
		}

		for (LocalDateTime startTime : startTimes) {
			ConcertDetail detail = ConcertDetail.of(concert, startTime);
			concertDetailRepository.save(detail);
		}
	}

	private Artist findArtist(String artistName) {
		if (artistName == null || artistName.isEmpty()) {
			return null;
		}

		Optional<Artist> artistByKoreanName = artistRepository.findByArtistName(artistName);
		if (artistByKoreanName.isPresent()) {
			return artistByKoreanName.get();
		}

		Optional<Artist> artistByEnglishName = artistRepository.findByArtistEngName(artistName);
		if (artistByEnglishName.isPresent()) {
			return artistByEnglishName.get();
		}

		return null;
	}

	private Arena findMatchingArena(String arenaName) {
		if (arenaName == null || arenaName.isEmpty()) {
			log.warn("공연장 이름이 비어있음");
			return null;
		}

		VenueKeyword venue = VenueKeyword.findByVenueName(arenaName);

		if (venue != null) {
			return arenaRepository.findById(venue.getArenaId())
				.orElseThrow(() -> new BaseException(ErrorCode.ARENA_NOT_FOUND));
		} else {
			log.warn("일치하는 공연장 없음: {}", arenaName);
			return null;
		}
	}

	public boolean checkConcertExists(String concertName) {
		return concertRepository.existsByConcertName(concertName);
	}
}
