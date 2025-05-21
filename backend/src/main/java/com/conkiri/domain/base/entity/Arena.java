package com.conkiri.domain.base.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Arena {

	@Id
	@Column(name = "arena_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long arenaId;

	@Column(name = "arena_name", length = 100)
	private String arenaName;

	@Column(name = "arena_eng_name", length = 100)
	private String arenaEngName;

	@Column(name = "address", length = 100)
	private String address;

	@Column(name = "latitude")
	private Double latitude;

	@Column(name = "longitude")
	private Double longitude;

	@Column(name = "photo_url", length = 200)
	private String photoUrl;
}
