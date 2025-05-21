package com.conkiri.domain.notification.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.conkiri.domain.notification.entity.MyConcert;
import com.conkiri.domain.user.entity.User;

public interface MyConcertRepository extends JpaRepository<MyConcert, Long> {

	// 티켓팅 알림 대상 조회 (중복 제거)
	@Query("SELECT DISTINCT mc.user, mc.concert "
		+ "FROM MyConcert mc "
		+ "WHERE mc.ticketingNotificationEnabled = true "
		+ "AND (mc.concert.advancedReservation BETWEEN :startTime AND :endTime "
		+ "OR mc.concert.reservation BETWEEN :startTime AND :endTime)")
	List<Object[]> findUsersForTicketingNotification(
		@Param("startTime") LocalDateTime startTime,
		@Param("endTime") LocalDateTime endTime);

	// 입장 알림 대상 조회
	@Query("SELECT mc "
		+ "FROM MyConcert mc "
		+ "WHERE mc.entranceNotificationEnabled = true "
		+ "AND mc.concertDetail.startTime BETWEEN :startTime AND :endTime")
	List<MyConcert> findForEntranceNotification(
		@Param("startTime") LocalDateTime startTime,
		@Param("endTime") LocalDateTime endTime);

	List<MyConcert> findByUser(User user);

	@Query("SELECT mc FROM MyConcert mc " +
		"JOIN FETCH mc.user u " +
		"JOIN FETCH mc.concert c " +
		"WHERE u = :user AND c.concertId = :concertId")
	List<MyConcert> findByUserAndConcertId(@Param("user") User user, @Param("concertId") Long concertId);

}
