package com.conkiri.domain.notification.entity;

import com.conkiri.domain.base.entity.Artist;
import com.conkiri.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MyArtist {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "my_artist_id")
	private Long myArtistId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "artist_id", nullable = false)
	private Artist artist;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	private MyArtist(Artist artist, User user) {
		this.artist = artist;
		this.user = user;
	}

	public static MyArtist of(Artist artist, User user) {
		return new MyArtist(artist, user);
	}
}