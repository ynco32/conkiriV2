package com.conkiri.domain.base.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.conkiri.domain.base.entity.Artist;

public interface ArtistRepository extends JpaRepository<Artist, Long>, ArtistRepositoryCustom {

    Optional<Artist> findByArtistName(String artistName);

    Optional<Artist> findByArtistEngName(String artistEngName);
}