package com.conkiri.domain.sharing.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.conkiri.domain.sharing.dto.response.CommentResponseDTO;
import com.conkiri.domain.sharing.entity.Comment;
import com.conkiri.domain.sharing.entity.QComment;
import com.conkiri.domain.sharing.entity.Sharing;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

@Repository
public class CommentRepositoryCustomImpl implements CommentRepositoryCustom {

	private final JPAQueryFactory jpaQueryFactory;

	public CommentRepositoryCustomImpl(EntityManager entityManager) {
		this.jpaQueryFactory = new JPAQueryFactory(entityManager);
	}

	@Override
	public CommentResponseDTO findComments(Sharing sharing, Long lastCommentId, Pageable pageable) {

		QComment comment = QComment.comment;

		// 기본 조건 : 해당 나눔 게시글의 댓글만 조회
		BooleanExpression conditions = comment.sharing.sharingId.eq(sharing.getSharingId());

		// 첫 조회가 아닐 때
		if (lastCommentId != null) {
			conditions = conditions.and(comment.commentId.gt(lastCommentId));
		}

		// Query 실행
		List<Comment> results = jpaQueryFactory
			.selectFrom(comment)
			.where(conditions)
			.orderBy(comment.commentId.asc())
			.limit(pageable.getPageSize() + 1L)
			.fetch();

		boolean hasNext = results.size() > pageable.getPageSize();

		if (hasNext) {
			results.remove(results.size() - 1);
		}

		return CommentResponseDTO.of(results, hasNext);
	}
}
