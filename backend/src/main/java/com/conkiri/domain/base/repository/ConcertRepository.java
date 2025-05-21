package com.conkiri.domain.base.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.conkiri.domain.base.entity.Concert;

public interface ConcertRepository extends JpaRepository<Concert, Long>, ConcertRepositoryCustom {

	//List<Concert> findByArtistContaining(String artist);

	// 특정 시간 범위 내의 startTime을 가지는 Concert조회
	//List<Concert> findByStartTimeBetween(LocalDateTime now, LocalDateTime end);

	// 오늘 날짜에 선예매 또는 일반예매가 있는 콘서트 찾기
	@Query("SELECT c "
		+ "FROM Concert c "
		+ "WHERE DATE(c.advancedReservation) = CURRENT_DATE OR DATE(c.reservation) = CURRENT_DATE "
		+ "ORDER BY c.arena.arenaId ASC")
	List<Concert> findConcertsWithTicketingToday();

	boolean existsByConcertName(String concertName);
}
