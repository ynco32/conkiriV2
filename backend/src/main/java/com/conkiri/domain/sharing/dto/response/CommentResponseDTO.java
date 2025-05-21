package com.conkiri.domain.sharing.dto.response;

import java.util.List;

import com.conkiri.domain.sharing.entity.Comment;

public record CommentResponseDTO(
	List<CommentDetailResponseDTO> comments,
	boolean isLastPage
) {
	public static CommentResponseDTO of(List<Comment> comments, boolean hasNext) {
		return new CommentResponseDTO(
			comments.stream()
				.map(CommentDetailResponseDTO::from)
				.toList(),
			!hasNext
		);
	}
}
