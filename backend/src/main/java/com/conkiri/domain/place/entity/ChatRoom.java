package com.conkiri.domain.place.entity;

import com.conkiri.domain.base.entity.Arena;
import com.conkiri.global.common.BaseTime;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom extends BaseTime {

	@Id
	@Column(name = "chat_room_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long chatRoomId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "arena_id", nullable = false)
	private Arena arena;
}