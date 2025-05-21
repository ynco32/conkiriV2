package com.conkiri.domain.place.repository;

import java.util.List;

import com.conkiri.domain.place.entity.Marker;

public interface MarkerRepositoryCustom {
	List<Marker> findMarkers(Long arenaId, String category);
}
