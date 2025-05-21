package com.conkiri.domain.ticketing.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.conkiri.domain.ticketing.entity.Result;
import com.conkiri.domain.user.entity.User;

public interface ResultRepository extends JpaRepository<Result, Long> {

	List<Result> findByUserOrderByReserveTimeDesc(User user);

}
