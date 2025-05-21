package com.conkiri.domain.base.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.entity.Arena;
import com.conkiri.domain.base.repository.ArenaRepository;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArenaReadService {

	private final ArenaRepository arenaRepository;

	public Arena findArenaByAreaIdOrElseThrow(Long arenaId) {

		return arenaRepository.findArenaByArenaId(arenaId)
			.orElseThrow(() -> new BaseException(ErrorCode.ARENA_NOT_FOUND));
	}
}