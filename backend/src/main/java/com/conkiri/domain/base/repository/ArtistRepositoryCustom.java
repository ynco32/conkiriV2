package com.conkiri.domain.base.repository;

import com.conkiri.domain.base.dto.response.ArtistResponseDTO;
import com.conkiri.domain.user.entity.User;

public interface ArtistRepositoryCustom {

	ArtistResponseDTO findArtists(Long lastArtistId, String searchWord, User user);

	ArtistResponseDTO findMyArtists(User user);
}
