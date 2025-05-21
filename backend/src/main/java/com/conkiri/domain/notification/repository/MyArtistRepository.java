package com.conkiri.domain.notification.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.conkiri.domain.base.entity.Artist;
import com.conkiri.domain.notification.entity.MyArtist;
import com.conkiri.domain.user.entity.User;

public interface MyArtistRepository extends JpaRepository<MyArtist, Long> {

	@Query("SELECT ma FROM MyArtist ma " +
		"JOIN FETCH ma.user " +
		"JOIN FETCH ma.artist " +
		"WHERE ma.artist IN :artists")
	List<MyArtist> findByArtistInWithUser(@Param("artists") List<Artist> artists);

	List<MyArtist> findByUser(User user);

	@Query("SELECT ma FROM MyArtist ma " +
		"JOIN FETCH ma.user u " +
		"JOIN FETCH ma.artist a " +
		"WHERE u = :user AND a.artistId = :artistId")
	Optional<MyArtist> findByUserAndArtistId(@Param("user") User user, @Param("artistId") Long artistId);
}
