package com.conkiri.domain.base.repository;

import static com.conkiri.domain.base.entity.QArtist.*;
import static com.conkiri.domain.base.entity.QCast.*;
import static com.conkiri.domain.base.entity.QConcert.*;
import static com.conkiri.domain.base.entity.QConcertDetail.*;
import static com.conkiri.domain.notification.entity.QMyConcert.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.conkiri.domain.base.dto.response.ConcertCastResponseDTO;
import com.conkiri.domain.base.dto.response.ConcertDetailResponseDTO;
import com.conkiri.domain.base.dto.response.ConcertResponseDTO;
import com.conkiri.domain.base.dto.response.ConcertSessionDTO;
import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.entity.QArtist;
import com.conkiri.domain.base.entity.QCast;
import com.conkiri.domain.base.entity.QConcert;
import com.conkiri.domain.user.entity.User;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

@Repository
public class ConcertRepositoryCustomImpl implements ConcertRepositoryCustom {

	private final JPAQueryFactory queryFactory;
	private static final int PAGE_SIZE = 8;

	public ConcertRepositoryCustomImpl(EntityManager entityManager) {
		this.queryFactory = new JPAQueryFactory(entityManager);
	}

	@Override
	public ConcertResponseDTO findConcerts(Long lastConcertId, String searchWord, User currentUser) {
		LocalDateTime today = LocalDateTime.now();

		List<Long> pagedConcertIds = fetchConcertIdsWithPaging(lastConcertId, searchWord, today);
		if (pagedConcertIds.isEmpty()) {
			return ConcertResponseDTO.of(List.of(), true);
		}

		boolean hasNext = pagedConcertIds.size() > PAGE_SIZE;
		List<Long> finalConcertIds = hasNext ? pagedConcertIds.subList(0, PAGE_SIZE) : pagedConcertIds;
		Set<Long> concertIdSet = new HashSet<>(finalConcertIds);

		Map<Long, ConcertBasicInfo> basicInfoMap = fetchConcertBasicInfoBatch(concertIdSet);
		Map<Long, List<ConcertSessionDTO>> sessionMap = fetchConcertSessionsBatch(concertIdSet, today);
		Map<Long, List<ConcertCastResponseDTO>> artistMap = findArtistsByConcertIdsBatch(concertIdSet);

		Map<Long, Boolean> ticketingNotifications = new HashMap<>();
		applyUserSettingsBatch(currentUser, concertIdSet, sessionMap, ticketingNotifications);

		List<ConcertDetailResponseDTO> responseDTOs = finalConcertIds.stream()
			.map(concertId -> {
				ConcertBasicInfo info = basicInfoMap.get(concertId);
				if (info == null) return null;

				return new ConcertDetailResponseDTO(
					concertId,
					info.name,
					info.photoUrl,
					info.arenaName,
					ticketingNotifications.getOrDefault(concertId, false),
					artistMap.getOrDefault(concertId, List.of()),
					sessionMap.getOrDefault(concertId, List.of())
				);
			})
			.filter(Objects::nonNull)
			.toList();

		return ConcertResponseDTO.of(responseDTOs, !hasNext);
	}

	@Override
	public ConcertResponseDTO findMyConcerts(User user) {

		List<Long> myConcertIds = queryFactory
			.select(myConcert.concert.concertId)
			.from(myConcert)
			.where(myConcert.user.eq(user))
			.groupBy(myConcert.concert.concertId)
			.orderBy(myConcert.createdAt.max().desc())
			.fetch();


		if (myConcertIds.isEmpty()) {
			return ConcertResponseDTO.of(List.of(), true);
		}
		Set<Long> concertIdSet = new HashSet<>(myConcertIds);

		Map<Long, ConcertBasicInfo> basicInfoMap = fetchConcertBasicInfoBatch(concertIdSet);
		Map<Long, List<ConcertSessionDTO>> sessionMap = fetchMyConcertSessionsBatch(user, concertIdSet);
		Map<Long, List<ConcertCastResponseDTO>> artistMap = findArtistsByConcertIdsBatch(concertIdSet);

		List<ConcertDetailResponseDTO> responseDTOs = myConcertIds.stream()
			.map(concertId -> {
				ConcertBasicInfo info = basicInfoMap.get(concertId);
				if (info == null) return null;

				return new ConcertDetailResponseDTO(
					concertId,
					info.name,
					info.photoUrl,
					info.arenaName,
					true,
					artistMap.getOrDefault(concertId, List.of()),
					sessionMap.getOrDefault(concertId, List.of())
				);
			})
			.filter(Objects::nonNull)
			.toList();

		return ConcertResponseDTO.of(responseDTOs, true);
	}

	/**
	 * 페이징을 위한 콘서트 ID 목록 조회
	 */
	private List<Long> fetchConcertIdsWithPaging(Long lastConcertId, String searchWord, LocalDateTime today) {
		return queryFactory
			.select(concert.concertId)
			.from(concert)
			.where(
				ltConcertId(lastConcertId),
				searchCondition(searchWord),
				JPAExpressions
					.selectOne()
					.from(concertDetail)
					.where(
						concertDetail.concert.eq(concert),
						concertDetail.startTime.goe(today)
					)
					.exists()
			)
			.orderBy(concert.concertId.desc())
			.limit(PAGE_SIZE + 1L)
			.fetch();
	}

	/**
	 * 여러 콘서트의 기본 정보를 한 번에 조회 (배치 처리)
	 */
	private Map<Long, ConcertBasicInfo> fetchConcertBasicInfoBatch(Set<Long> concertIds) {
		if (concertIds.isEmpty()) {
			return Map.of();
		}

		List<Tuple> concertInfoData = queryFactory
			.select(
				concert.concertId,
				concert.concertName,
				concert.photoUrl,
				concert.arena.arenaName
			)
			.from(concert)
			.join(concert.arena)
			.where(concert.concertId.in(concertIds))
			.fetch();

		Map<Long, ConcertBasicInfo> result = new HashMap<>();
		for (Tuple tuple : concertInfoData) {
			Long concertId = tuple.get(0, Long.class);
			String concertName = tuple.get(1, String.class);
			String photoUrl = tuple.get(2, String.class);
			String arenaName = tuple.get(3, String.class);

			result.put(concertId, new ConcertBasicInfo(concertName, photoUrl, arenaName));
		}

		return result;
	}

	/**
	 * 여러 콘서트의 회차 정보를 한 번에 조회 (배치 처리)
	 */
	private Map<Long, List<ConcertSessionDTO>> fetchConcertSessionsBatch(Set<Long> concertIds, LocalDateTime today) {
		if (concertIds.isEmpty()) {
			return Map.of();
		}

		List<Tuple> sessionsData = queryFactory
			.select(
				concertDetail.concert.concertId,
				concertDetail.concertDetailId,
				concertDetail.startTime
			)
			.from(concertDetail)
			.where(concertDetail.concert.concertId.in(concertIds))
			.orderBy(concertDetail.startTime.asc())
			.fetch();

		Map<Long, List<ConcertSessionDTO>> result = new HashMap<>();
		for (Tuple tuple : sessionsData) {
			Long concertId = tuple.get(0, Long.class);
			Long detailId = tuple.get(1, Long.class);
			LocalDateTime startTime = tuple.get(2, LocalDateTime.class);
			boolean isEnded = startTime.isBefore(today);

			result.computeIfAbsent(concertId, k -> new ArrayList<>())
				.add(new ConcertSessionDTO(detailId, startTime, false, isEnded, false));
		}

		return result;
	}

	/**
	 * 내 공연의 회차 정보 및 설정을 한 번에 조회 (배치 처리)
	 */
	private Map<Long, List<ConcertSessionDTO>> fetchMyConcertSessionsBatch(User user, Set<Long> concertIds) {
		if (concertIds.isEmpty()) {
			return Map.of();
		}

		List<Tuple> userConcertData = queryFactory
			.select(
				myConcert.concert.concertId,
				myConcert.concertDetail.concertDetailId,
				concertDetail.startTime,
				myConcert.entranceNotificationEnabled,
				myConcert.attended
			)
			.from(myConcert)
			.join(myConcert.concertDetail, concertDetail)
			.where(
				myConcert.user.eq(user),
				myConcert.concert.concertId.in(concertIds)
			)
			.orderBy(concertDetail.startTime.asc())
			.fetch();

		Map<Long, List<ConcertSessionDTO>> result = new HashMap<>();
		LocalDateTime today = LocalDateTime.now();

		for (Tuple tuple : userConcertData) {
			Long concertId = tuple.get(0, Long.class);
			Long detailId = tuple.get(1, Long.class);
			LocalDateTime startTime = tuple.get(2, LocalDateTime.class);
			Boolean entranceEnabled = tuple.get(3, Boolean.class);
			Boolean attended = tuple.get(4, Boolean.class);

			boolean isEnded = startTime.isBefore(today);

			result.computeIfAbsent(concertId, k -> new ArrayList<>())
				.add(new ConcertSessionDTO(detailId, startTime, entranceEnabled, isEnded, attended));
		}

		return result;
	}

	/**
	 * 여러 콘서트의 아티스트 정보를 한 번에 조회 (배치 처리)
	 */
	private Map<Long, List<ConcertCastResponseDTO>> findArtistsByConcertIdsBatch(Set<Long> concertIds) {
		if (concertIds.isEmpty()) {
			return Map.of();
		}

		List<Tuple> artistsData = queryFactory
			.select(
				cast.concert.concertId,
				cast.artist.artistId,
				cast.artist.artistName
			)
			.from(cast)
			.join(cast.artist, artist)
			.where(cast.concert.concertId.in(concertIds))
			.fetch();

		return artistsData.stream()
			.collect(Collectors.groupingBy(
				tuple -> tuple.get(0, Long.class),
				Collectors.mapping(
					tuple -> new ConcertCastResponseDTO(
						tuple.get(1, Long.class),
						tuple.get(2, String.class)
					),
					Collectors.toList()
				)
			));
	}

	/**
	 * 여러 콘서트의 사용자 설정 정보를 한 번에 조회 및 적용 (배치 처리)
	 */
	private void applyUserSettingsBatch(
		User user,
		Set<Long> concertIds,
		Map<Long, List<ConcertSessionDTO>> sessionsByConcertId,
		Map<Long, Boolean> ticketingNotifications) {

		if (concertIds.isEmpty() || user == null) {
			return;
		}

		List<Tuple> userSettings = queryFactory
			.select(
				myConcert.concert.concertId,
				myConcert.concertDetail.concertDetailId,
				myConcert.entranceNotificationEnabled,
				myConcert.attended
			)
			.from(myConcert)
			.where(
				myConcert.user.eq(user),
				myConcert.concert.concertId.in(concertIds)
			)
			.fetch();

		Set<Long> userConcertIds = userSettings.stream()
			.map(tuple -> tuple.get(0, Long.class))
			.collect(Collectors.toSet());

		for (Long concertId : userConcertIds) {
			ticketingNotifications.put(concertId, true);
		}

		Map<Long, Boolean> entranceNotifications = new HashMap<>();
		Map<Long, Boolean> attendedStatus = new HashMap<>();

		for (Tuple tuple : userSettings) {
			Long detailId = tuple.get(1, Long.class);
			Boolean entranceEnabled = tuple.get(2, Boolean.class);
			Boolean attended = tuple.get(3, Boolean.class);

			entranceNotifications.put(detailId, entranceEnabled);
			attendedStatus.put(detailId, attended);
		}

		for (Map.Entry<Long, List<ConcertSessionDTO>> entry : sessionsByConcertId.entrySet()) {
			List<ConcertSessionDTO> updatedSessions = entry.getValue().stream()
				.map(session -> {
					boolean notificationEnabled = entranceNotifications.getOrDefault(session.concertDetailId(), false);
					boolean attended = attendedStatus.getOrDefault(session.concertDetailId(), false);
					return new ConcertSessionDTO(
						session.concertDetailId(),
						session.startTime(),
						notificationEnabled,
						session.isEnded(),
						attended
					);
				})
				.toList();

			entry.setValue(updatedSessions);
		}
	}

	private BooleanExpression ltConcertId(Long lastConcertId) {
		return lastConcertId != null ? concert.concertId.lt(lastConcertId) : null;
	}

	private BooleanExpression searchCondition(String searchWord) {
		if (searchWord == null || searchWord.trim().isEmpty()) {
			return null;
		}

		String keyword = searchWord.trim();
		return concert.concertName.containsIgnoreCase(keyword)
			.or(concert.concertId.in(
				JPAExpressions
					.select(cast.concert.concertId)
					.from(cast)
					.join(cast.artist, artist)
					.where(artist.artistName.containsIgnoreCase(keyword))
			));
	}

	private record ConcertBasicInfo(String name, String photoUrl, String arenaName) {}

	@Override
	public List<Concert> findConcertsByArtist(String artistName) {
		QConcert concert = QConcert.concert;
		QCast cast = QCast.cast;
		QArtist artist = QArtist.artist;

		return queryFactory
			.selectFrom(concert)
			.leftJoin(concert.arena).fetchJoin()
			.innerJoin(cast).on(cast.concert.eq(concert))
			.innerJoin(artist).on(cast.artist.eq(artist))
			.where(artist.artistName.containsIgnoreCase(artistName)
				.or(artist.artistEngName.containsIgnoreCase(artistName)))
			.distinct()
			.fetch();
	}
}