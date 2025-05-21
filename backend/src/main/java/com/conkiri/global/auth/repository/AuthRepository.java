package com.conkiri.global.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.conkiri.domain.user.entity.User;
import com.conkiri.global.auth.entity.Auth;

public interface AuthRepository extends JpaRepository<Auth, Long> {

	void deleteByUser(User user);
	Optional<Auth> findByUser(User user);
	boolean existsByUser(User user);
}
