package com.conkiri.domain.base.repository;

import com.conkiri.domain.base.dto.response.ArenaResponseDTO;

public interface ArenaRepositoryCustom {

	ArenaResponseDTO findArenas(String searchWord);
}
