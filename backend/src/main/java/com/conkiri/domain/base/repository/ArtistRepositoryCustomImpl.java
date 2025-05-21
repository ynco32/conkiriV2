package com.conkiri.domain.base.repository;

import static com.conkiri.domain.base.entity.QArtist.*;
import static com.conkiri.domain.notification.entity.QMyArtist.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.conkiri.domain.base.dto.response.ArtistDetailResponseDTO;
import com.conkiri.domain.base.dto.response.ArtistResponseDTO;
import com.conkiri.domain.base.entity.Artist;
import com.conkiri.domain.notification.repository.MyArtistRepository;
import com.conkiri.domain.user.entity.User;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

@Repository
public class ArtistRepositoryCustomImpl implements ArtistRepositoryCustom {

	private static final int PAGE_SIZE = 15;
	private final JPAQueryFactory queryFactory;
	private final MyArtistRepository myArtistRepository;

	public ArtistRepositoryCustomImpl(EntityManager entityManager, MyArtistRepository myArtistRepository) {
		this.queryFactory = new JPAQueryFactory(entityManager);
		this.myArtistRepository = myArtistRepository;
	}

	@Override
	public ArtistResponseDTO findArtists(Long lastArtistId, String searchWord, User currentUser) {

		List<Artist> artists = queryFactory
			.selectFrom(artist)
			.where(
				gtArtistId(lastArtistId),
				searchCondition(searchWord)
			)
			.orderBy(artist.artistId.asc())
			.limit(PAGE_SIZE + 1L)
			.fetch();

		Set<Long> followingArtistIds = getFollowingArtistIds(currentUser);
		return createArtistResponseDTO(artists, followingArtistIds);
	}

	@Override
	public ArtistResponseDTO findMyArtists(User user) {
		List<Artist> artists = queryFactory
			.select(artist)
			.from(myArtist)
			.join(myArtist.artist, artist)
			.where(
				myArtist.user.eq(user)
			)
			.orderBy(artist.artistId.asc())
			.fetch();

		return createArtistResponseDTO(artists, Set.of(artists.stream().map(Artist::getArtistId).toArray(Long[]::new)));
	}

	private BooleanExpression gtArtistId(Long lastArtistId) {

		return lastArtistId != null ? artist.artistId.gt(lastArtistId) : null;
	}

	private BooleanExpression searchCondition(String searchWord) {

		return searchWord != null && !searchWord.trim().isEmpty() ? artist.artistName.containsIgnoreCase(searchWord.trim()) : null;
	}


	private Set<Long> getFollowingArtistIds(User currentUser) {

		return myArtistRepository.findByUser(currentUser).stream()
			.map(myArtist -> myArtist.getArtist().getArtistId())
			.collect(Collectors.toSet());
	}

	private ArtistResponseDTO createArtistResponseDTO(List<Artist> artists, Set<Long> followingArtistIds) {
		boolean hasNext = false;
		if (artists.size() > PAGE_SIZE) {
			artists.remove(PAGE_SIZE);
			hasNext = true;
		}

		List<ArtistDetailResponseDTO> artistDetails = artists.stream()
			.map(artist -> ArtistDetailResponseDTO.of(
				artist,
				followingArtistIds.contains(artist.getArtistId())
			))
			.toList();

		return ArtistResponseDTO.of(artistDetails, !hasNext);
	}
}