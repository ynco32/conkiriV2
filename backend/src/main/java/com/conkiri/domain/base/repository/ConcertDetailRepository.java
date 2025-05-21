package com.conkiri.domain.base.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.conkiri.domain.base.entity.ConcertDetail;

public interface ConcertDetailRepository extends JpaRepository<ConcertDetail, Long> {

}
