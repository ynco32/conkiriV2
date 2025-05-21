package com.conkiri.domain.base.repository;

import java.util.List;

import com.conkiri.domain.base.dto.response.ConcertResponseDTO;
import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.user.entity.User;

public interface ConcertRepositoryCustom {

	ConcertResponseDTO findConcerts(Long lastConcertDetailId, String searchWord, User currentUser);

	ConcertResponseDTO findMyConcerts(User user);

	List<Concert> findConcertsByArtist(String searchWord);
}
