package com.conkiri.domain.view.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.conkiri.domain.view.entity.SectionLayout;

public interface SectionLayoutRepository extends JpaRepository<SectionLayout, Long> {
	Optional<SectionLayout> findByArena_ArenaIdAndSection(Long arenaId, String section);
}