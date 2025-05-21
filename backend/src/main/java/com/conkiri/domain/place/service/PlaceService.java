package com.conkiri.domain.place.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.conkiri.domain.base.service.ArenaReadService;
import com.conkiri.domain.place.dto.response.MarkerResponseDTO;
import com.conkiri.domain.place.entity.Category;
import com.conkiri.domain.place.entity.Marker;
import com.conkiri.domain.place.repository.MarkerRepositoryCustom;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlaceService {

	private final MarkerRepositoryCustom markerRepositoryCustom;
	private final ArenaReadService arenaReadService;

	public MarkerResponseDTO getMarkers(Long arenaId, String category) {
		arenaReadService.findArenaByAreaIdOrElseThrow(arenaId);
		if (category != null && !category.isBlank()) isCategoryValid(category);

		List<Marker> markers = markerRepositoryCustom.findMarkers(arenaId, category);

		return MarkerResponseDTO.from(markers);
	}

	// ================== 내부 메서드 ==================== //

	private void isCategoryValid(String category) {
        try {
            Category.valueOf(category.toUpperCase());
        } catch (Exception e) {
			throw new BaseException(ErrorCode.INVALID_CATEGORY);
        }
    }
}