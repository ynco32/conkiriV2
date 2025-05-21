package com.conkiri.domain.sharing.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.TimeZoneColumn;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.sharing.dto.request.SharingRequestDTO;
import com.conkiri.domain.sharing.dto.request.SharingUpdateRequestDTO;
import com.conkiri.domain.user.entity.User;
import com.conkiri.global.common.BaseTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
public class Sharing extends BaseTime {

	@Id
	@Column(name = "sharing_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long sharingId;

	@Column(name = "latitude")
	private Double latitude;

	@Column(name = "longitude")
	private Double longitude;

	@Column(name = "title", length = 100)
	private String title;

	@Column(name = "content", length = 500)
	private String content;

	@Column(name = "photo_url", length = 250)
	private String photoUrl;

	@Column(name = "status")
	@Enumerated(EnumType.STRING)
	@ColumnDefault("'UPCOMING'")
	private Status status = Status.UPCOMING;

	@Column(name = "start_time", columnDefinition = "TIMESTAMP")
	@TimeZoneColumn()
	private LocalDateTime startTime;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "concert_id")
	private Concert concert;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	public static Sharing of(SharingRequestDTO sharingRequestDTO, String photoUrl, Concert concert, User user) {
		return new Sharing(sharingRequestDTO, photoUrl, concert, user);
	}

	private Sharing(SharingRequestDTO sharingRequestDTO, String photoUrl, Concert concert, User user) {
		this.latitude = sharingRequestDTO.latitude();
		this.longitude = sharingRequestDTO.longitude();
		this.title = sharingRequestDTO.title();
		this.content = sharingRequestDTO.content();
		//ocalDateTime startTime = concert.getStartTime().atZone(ZoneId.of("Asia/Seoul")).toLocalDate()
		//	.atTime(sharingRequestDTO.startTime().atZone(ZoneId.of("Asia/Seoul")).toLocalTime());
		this.startTime = LocalDateTime.now();
		this.photoUrl = photoUrl;
		this.concert = concert;
		this.user = user;
	}

	public void update(SharingUpdateRequestDTO sharingUpdateRequestDTO, /*Concert concert,*/ String photoUrl) {
		this.title = sharingUpdateRequestDTO.title() != null ? sharingUpdateRequestDTO.title() : this.title;
		this.content = sharingUpdateRequestDTO.content() != null ? sharingUpdateRequestDTO.content() : this.content;
		this.photoUrl = photoUrl != null ? photoUrl : this.photoUrl;
		this.latitude = sharingUpdateRequestDTO.latitude() != null ? sharingUpdateRequestDTO.latitude() : this.latitude;
		this.longitude = sharingUpdateRequestDTO.longitude() != null ? sharingUpdateRequestDTO.longitude() : this.longitude;
		//this.startTime = sharingUpdateRequestDTO.startTime() != null ? concert
		//																	.getStartTime()
		//																	.atZone(ZoneId.of("Asia/Seoul"))
		//																	.toLocalDate()
		//																	.atTime(
		//																		sharingUpdateRequestDTO
		//																			.startTime()
		//																			.atZone(ZoneId.of("Asia/Seoul"))
		//																			.toLocalTime()) : this.startTime;
	}

	public void updateStatus(String status) {
		this.status = Status.from(status);
	}
}
