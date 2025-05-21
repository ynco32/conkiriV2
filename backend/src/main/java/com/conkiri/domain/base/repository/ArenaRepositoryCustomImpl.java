package com.conkiri.domain.base.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.conkiri.domain.base.dto.response.ArenaResponseDTO;
import com.conkiri.domain.base.entity.Arena;
import com.conkiri.domain.base.entity.QArena;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

@Repository
public class ArenaRepositoryCustomImpl implements ArenaRepositoryCustom {

	private final JPAQueryFactory jpaQueryFactory;

	public ArenaRepositoryCustomImpl(EntityManager entityManager) {
		this.jpaQueryFactory = new JPAQueryFactory(entityManager);
	}

	@Override
	public ArenaResponseDTO findArenas(String searchWord) {
		QArena arena = QArena.arena;

		BooleanExpression searchCondition = (searchWord != null && !searchWord.isBlank()) ?
			arena.arenaName.containsIgnoreCase(searchWord) : null;

		BooleanExpression excludeCondition = arena.arenaId.notIn(1L, 2L, 8L);

		BooleanExpression finalCondition = searchCondition != null ?
			excludeCondition.and(searchCondition) : excludeCondition;

		List<Arena> results = jpaQueryFactory
			.selectFrom(arena)
			.where(finalCondition)
			.orderBy(arena.arenaId.asc())
			.fetch();

		return ArenaResponseDTO.from(results);
	}
}
