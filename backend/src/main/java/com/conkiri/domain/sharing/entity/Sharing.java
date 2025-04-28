package com.conkiri.domain.sharing.entity;

import java.time.LocalDateTime;
import java.time.ZoneId;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.TimeZoneColumn;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.sharing.dto.request.SharingRequestDTO;
import com.conkiri.domain.sharing.dto.request.SharingUpdateRequestDTO;
import com.conkiri.domain.user.entity.User;
import com.conkiri.global.domain.BaseTime;

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
import lombok.experimental.SuperBuilder;

@SuperBuilder
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
		this.latitude = sharingRequestDTO.getLatitude();
		this.longitude = sharingRequestDTO.getLongitude();
		this.title = sharingRequestDTO.getTitle();
		this.content = sharingRequestDTO.getContent();
		LocalDateTime startTime = concert.getStartTime().atZone(ZoneId.of("Asia/Seoul")).toLocalDate()
			.atTime(sharingRequestDTO.getStartTime().atZone(ZoneId.of("Asia/Seoul")).toLocalTime());
		this.startTime = startTime;
		this.photoUrl = photoUrl;
		this.concert = concert;
		this.user = user;
	}

	public void update(SharingUpdateRequestDTO sharingUpdateRequestDTO, Concert concert, String photoUrl) {
		this.title = sharingUpdateRequestDTO.getTitle() != null ? sharingUpdateRequestDTO.getTitle() : this.title;
		this.content = sharingUpdateRequestDTO.getContent() != null ? sharingUpdateRequestDTO.getContent() : this.content;
		this.photoUrl = photoUrl != null ? photoUrl : this.photoUrl;
		this.latitude = sharingUpdateRequestDTO.getLatitude() != null ? sharingUpdateRequestDTO.getLatitude() : this.latitude;
		this.longitude = sharingUpdateRequestDTO.getLongitude() != null ? sharingUpdateRequestDTO.getLongitude() : this.longitude;
		this.startTime = sharingUpdateRequestDTO.getStartTime() != null ? concert
																			.getStartTime()
																			.atZone(ZoneId.of("Asia/Seoul"))
																			.toLocalDate()
																			.atTime(
																				sharingUpdateRequestDTO
																					.getStartTime()
																					.atZone(ZoneId.of("Asia/Seoul"))
																					.toLocalTime()) : this.startTime;
	}

	public void updateStatus(String status) {
		this.status = Status.from(status);
	}
}
