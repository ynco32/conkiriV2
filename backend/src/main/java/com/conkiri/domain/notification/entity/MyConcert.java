package com.conkiri.domain.notification.entity;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.entity.ConcertDetail;
import com.conkiri.domain.user.entity.User;
import com.conkiri.global.common.BaseTime;

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
public class MyConcert extends BaseTime {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "my_concert_id")
	private Long myConcertId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "concert_id", nullable = false)
	private Concert concert;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "attended", nullable = false)
	private boolean attended;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "concert_detail_id")
	private ConcertDetail concertDetail;

	@Column(name = "ticketing_notification_enabled")
	private boolean ticketingNotificationEnabled;

	@Column(name = "entrance_notification_enabled")
	private boolean entranceNotificationEnabled;

	private MyConcert(Concert concert, User user, ConcertDetail concertDetail, boolean ticketingNotificationEnabled, boolean entranceNotificationEnabled) {
		this.concert = concert;
		this.user = user;
		this.concertDetail = concertDetail;
		this.attended = false;
		this.ticketingNotificationEnabled = ticketingNotificationEnabled;
		this.entranceNotificationEnabled = entranceNotificationEnabled;
	}

	public static MyConcert of(Concert concert, User user, ConcertDetail concertDetail, boolean ticketingNotificationEnabled, boolean entranceNotificationEnabled) {
		return new MyConcert(concert, user, concertDetail, ticketingNotificationEnabled, entranceNotificationEnabled);
	}

	public static MyConcert of(Concert concert, User user, boolean ticketingNotificationEnabled, boolean entranceNotificationEnabled) {
		return new MyConcert(concert, user, null, ticketingNotificationEnabled, entranceNotificationEnabled);
	}

	public void updateEntranceNotification(boolean entranceNotificationEnabled) {
		this.entranceNotificationEnabled = entranceNotificationEnabled;
	}
}
