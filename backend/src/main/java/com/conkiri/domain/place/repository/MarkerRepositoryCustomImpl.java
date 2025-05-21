package com.conkiri.domain.place.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.conkiri.domain.place.entity.Category;
import com.conkiri.domain.place.entity.Marker;
import com.conkiri.domain.place.entity.QMarker;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

@Repository
public class MarkerRepositoryCustomImpl implements MarkerRepositoryCustom {

	private final JPAQueryFactory jpaQueryFactory;

	public MarkerRepositoryCustomImpl(EntityManager entityManager) {
		this.jpaQueryFactory = new JPAQueryFactory(entityManager);
	}

	@Override
	public List<Marker> findMarkers(Long arenaId, String category) {
		QMarker marker = QMarker.marker;

		BooleanExpression conditions = marker.arena.arenaId.eq(arenaId);

		if (category != null && !category.isBlank()) {
			conditions = conditions.and(marker.category.eq(Category.valueOf(category.toUpperCase())));
		}

		return jpaQueryFactory
			.selectFrom(marker)
			.where(conditions)
			.fetch();
	}
}
