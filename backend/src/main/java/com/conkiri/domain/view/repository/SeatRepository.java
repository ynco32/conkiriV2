package com.conkiri.domain.view.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.conkiri.domain.view.entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, Long> {

	@Query("SELECT s FROM Seat s JOIN FETCH s.arena a WHERE a.arenaId = :arenaId AND s.section = :section")
	List<Seat> findByArena_ArenaIdAndSection(
		@Param("arenaId") Long arenaId,
		@Param("section") String section
	);

	Optional<Seat> findSeatBySectionAndRowLineAndColumnLineAndArena_ArenaId(String section, Long row, Long column, Long arenaId);
}
