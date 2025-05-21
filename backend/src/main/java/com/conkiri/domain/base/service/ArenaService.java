package com.conkiri.domain.base.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.dto.response.ArenaResponseDTO;
import com.conkiri.domain.base.repository.ArenaRepositoryCustom;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArenaService {

	private final ArenaRepositoryCustom arenaRepository;

	public ArenaResponseDTO getArenas(String searchWord) {
		return arenaRepository.findArenas(searchWord);
	}
}
