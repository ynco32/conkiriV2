package com.conkiri.domain.place.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.conkiri.domain.place.entity.ChatRoom;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
}