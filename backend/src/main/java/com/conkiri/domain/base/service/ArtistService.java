package com.conkiri.domain.base.service;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.dto.response.ArtistResponseDTO;
import com.conkiri.domain.base.entity.Artist;
import com.conkiri.domain.base.repository.ArtistRepository;
import com.conkiri.domain.notification.entity.MyArtist;
import com.conkiri.domain.notification.repository.MyArtistRepository;
import com.conkiri.domain.user.entity.User;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArtistService {

	private final ArtistRepository artistRepository;
	private final MyArtistRepository myArtistRepository;

	public ArtistResponseDTO getArtists(Long lastArtistId, String searchWord, User user) {

		return artistRepository.findArtists(lastArtistId, searchWord, user);
	}

	public ArtistResponseDTO getMyArtists(User user) {

		return artistRepository.findMyArtists(user);
	}


	@Transactional
	public void setMyArtists(List<Long> artistIds, User user) {

		List<MyArtist> currentMyArtists = getCurrentMyArtists(user);
		Set<Long> currentArtistIds = extractArtistIds(currentMyArtists);

		Set<Long> newArtistIdsSet = createNewArtistIdsSet(artistIds);
		List<MyArtist> toDelete = findItemsToDelete(currentMyArtists, newArtistIdsSet);
		List<Long> toAddIds = findIdsToAdd(newArtistIdsSet, currentArtistIds);

		deleteMyArtists(toDelete);
		addMyArtists(toAddIds, user);
	}

	@Transactional
	public void deleteMyArtist(Long artistId, User user) {

		MyArtist artist = findMyArtistById(user, artistId);
		myArtistRepository.delete(artist);
	}

	/**
	 * 사용자의 현재 관심 가수 목록 조회
	 */
	private List<MyArtist> getCurrentMyArtists(User user) {

		return myArtistRepository.findByUser(user);
	}

	/**
	 * MyArtist 목록에서 아티스트 ID만 추출
	 */
	private Set<Long> extractArtistIds(List<MyArtist> myArtists) {

		return myArtists.stream()
			.map(ma -> ma.getArtist().getArtistId())
			.collect(Collectors.toSet());
	}

	/**
	 * 새 아티스트 ID 세트 생성 (null 체크 포함)
	 */
	private Set<Long> createNewArtistIdsSet(List<Long> artistIds) {

		return artistIds != null ? Set.copyOf(artistIds) : Collections.emptySet();
	}

	/**
	 * 삭제할 MyArtist 항목 찾기
	 */
	private List<MyArtist> findItemsToDelete(List<MyArtist> currentMyArtists, Set<Long> newArtistIdsSet) {

		return currentMyArtists.stream()
			.filter(ma -> !newArtistIdsSet.contains(ma.getArtist().getArtistId()))
			.toList();
	}

	/**
	 * 추가할 아티스트 ID 찾기
	 */
	private List<Long> findIdsToAdd(Set<Long> newArtistIdsSet, Set<Long> currentArtistIds) {

		return newArtistIdsSet.stream()
			.filter(id -> !currentArtistIds.contains(id))
			.toList();
	}

	/**
	 * 관심 가수 삭제
	 */
	private void deleteMyArtists(List<MyArtist> toDelete) {

		if (!toDelete.isEmpty()) {
			myArtistRepository.deleteAll(toDelete);
		}
	}

	/**
	 * 관심 가수 추가
	 */
	private void addMyArtists(List<Long> toAddIds, User user) {

		if (!toAddIds.isEmpty()) {

			List<Artist> artistsToAdd = artistRepository.findAllById(toAddIds);
			if (artistsToAdd.size() != toAddIds.size()) {
				throw new BaseException(ErrorCode.ARTIST_NOT_FOUND);
			}

			List<MyArtist> myArtistsToAdd = artistsToAdd.stream()
				.map(artist -> MyArtist.of(artist, user))
				.toList();
			myArtistRepository.saveAll(myArtistsToAdd);
		}
	}

	private MyArtist findMyArtistById(User user, Long artistId) {

		return myArtistRepository.findByUserAndArtistId(user, artistId)
			.orElseThrow(() -> new BaseException(ErrorCode.ARTIST_NOT_FOUND));
	}

}