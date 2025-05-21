package com.conkiri.domain.chatbot.repository;

import com.conkiri.domain.base.entity.Concert;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import com.conkiri.domain.chatbot.entity.ConcertNotice;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConcertNoticeRepository extends JpaRepository<ConcertNotice, Long> {

}
