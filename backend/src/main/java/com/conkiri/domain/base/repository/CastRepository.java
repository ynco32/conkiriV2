package com.conkiri.domain.base.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.conkiri.domain.base.entity.Cast;
import com.conkiri.domain.base.entity.Concert;

public interface CastRepository extends JpaRepository<Cast, Long> {

	@Query("SELECT c FROM Cast c " +
		"JOIN FETCH c.artist " +
		"JOIN FETCH c.concert " +
		"WHERE c.concert IN :concerts")
	List<Cast> findByConcertInWithArtist(@Param("concerts") List<Concert> concerts);

	@Query("SELECT c FROM Cast c " +
		"JOIN FETCH c.artist " +
		"WHERE c.concert = :concert")
	List<Cast> findByConcertWithArtist(@Param("concert") Concert concert);
}
