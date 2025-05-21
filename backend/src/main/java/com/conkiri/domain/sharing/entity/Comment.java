package com.conkiri.domain.sharing.entity;

import com.conkiri.domain.sharing.dto.request.CommentRequestDTO;
import com.conkiri.domain.sharing.dto.request.CommentUpdateRequestDTO;
import com.conkiri.domain.user.entity.User;
import com.conkiri.global.common.BaseTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment extends BaseTime {

	@Id
	@Column(name = "comment_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long commentId;

	@Column(name = "content", length = 250)
	private String content;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sharing_id")
	private Sharing sharing;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	public static Comment of(CommentRequestDTO commentRequestDTO, Sharing sharing, User user) {
		return new Comment(commentRequestDTO, sharing, user);
	}

	private Comment(CommentRequestDTO commentRequestDTO, Sharing sharing, User user) {
		this.content = commentRequestDTO.content();
		this.sharing = sharing;
		this.user = user;
	}

	public void update(CommentUpdateRequestDTO commentUpdateRequestDTO) {
		this.content = commentUpdateRequestDTO.content();
	}
}
