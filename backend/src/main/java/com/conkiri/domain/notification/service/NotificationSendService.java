package com.conkiri.domain.notification.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.entity.Cast;
import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.entity.ConcertDetail;
import com.conkiri.domain.base.repository.CastRepository;
import com.conkiri.domain.notification.dto.response.NotificationMessage;
import com.conkiri.domain.notification.entity.NotificationType;
import com.conkiri.domain.user.entity.User;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationSendService {

	private final CastRepository castRepository;
	private final NotificationProducer notificationProducer;
	private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

	/**
	 * 티켓팅 알림 메시지 생성 및 발송
	 */
	public void sendTicketingNotification(User user, Concert concert, NotificationType type) {
		try {
			NotificationMessage message = createTicketingMessage(user, concert, type);
			notificationProducer.sendNotification(message);

			log.info("티켓팅 알림 발송 완료: userId={}, concertId={}, type={}", user.getUserId(), concert.getConcertId(), type);
		} catch (Exception e) {
			log.error("티켓팅 알림 발송 실패: userId={}, concertId={}, type={}", user.getUserId(), concert.getConcertId(), type, e);
			throw new BaseException(ErrorCode.FAIL_NOTIFICATION);
		}
	}

	public void sendEntranceNotification(User user, Concert concert, ConcertDetail concertDetail, NotificationType type) {
		try {
			NotificationMessage message = createEntranceMessage(user, concert, concertDetail, type);
			notificationProducer.sendNotification(message);
			log.info("입장 알림 발송 완료: userId={}, concertId={}, type={}", user.getUserId(), concert.getConcertId(), type);
		} catch (Exception e) {
			log.error("입장 알림 발송 실패: userId={}, concertId={}, type={}", user.getUserId(), concert.getConcertId(), type, e);
			throw new BaseException(ErrorCode.FAIL_NOTIFICATION);
		}
	}

	private NotificationMessage createTicketingMessage(User user, Concert concert, NotificationType type) {
		String title = createTitle(type);
		String body = createTicketingBody(type, concert);

		return new NotificationMessage(
			user.getUserId(),
			concert.getConcertId(),
			title,
			body,
			type,
			LocalDateTime.now()
		);
	}

	private NotificationMessage createEntranceMessage(User user, Concert concert, ConcertDetail concertDetail, NotificationType type) {
		String title = createTitle(type);
		String body = createEntranceBody(type, concert, concertDetail);

		return new NotificationMessage(
			user.getUserId(),
			concert.getConcertId(),
			title,
			body,
			type,
			LocalDateTime.now()
		);
	}

	private String createTitle(NotificationType type) {
		return type.getTitle();
	}

	private String createTicketingBody(NotificationType type, Concert concert) {

		return switch (type) {
			case CONCERT_OPEN -> createConcertOpenBody(concert);
			case TICKETING_DAY -> createTicketingDayBody(concert);
			case TICKETING_SOON -> createTicketingSoonBody(concert);
			default -> "알림";
		};
	}

	private String createEntranceBody(NotificationType type, Concert concert, ConcertDetail concertDetail) {
		return switch (type) {
			case CONCERT_DAY -> createConcertDayBody(concert);
			case CONCERT_SOON -> createConcertSoonBody(concert, concertDetail);
			default -> "알림";
		};
	}

	private String createConcertOpenBody(Concert concert) {
		List<Cast> casts = castRepository.findByConcertWithArtist(concert);
		String artistNames = casts.stream()
			.map(cast -> cast.getArtist().getArtistName())
			.collect(Collectors.joining(", "));

		return String.format("%s의 새로운 공연 '%s'이(가) 오픈되었습니다!",
			artistNames, concert.getConcertName());
	}

	private String createTicketingDayBody(Concert concert) {

		LocalDateTime ticketingTime = getTicketingTime(concert);
		String ticketingType = isAdvancedReservationToday(concert) ? "선예매" : "일반예매";

		return String.format("오늘 %s에 %s %s가 시작됩니다.",
			ticketingTime.format(TIME_FORMATTER),
			concert.getConcertName(),
			ticketingType);
	}

	private String createTicketingSoonBody(Concert concert) {

		LocalDateTime ticketingTime = getTicketingTime(concert);
		String ticketingType = isAdvancedReservationSoon(concert) ? "선예매" : "일반예매";

		return String.format("잠시 후 %s에 %s %s가 시작됩니다.",
			ticketingTime.format(TIME_FORMATTER),
			concert.getConcertName(),
			ticketingType);
	}

	private String createConcertDayBody(Concert concert) {

		return String.format("오늘은 %s 당일입니다.",
			concert.getConcertName());
	}

	private String createConcertSoonBody(Concert concert, ConcertDetail concertDetail) {

		return String.format("잠시 후 %s에 %s이(가) 시작됩니다.",
			concertDetail.getStartTime().format(TIME_FORMATTER),
			concert.getConcertName());
	}

	private LocalDateTime getTicketingTime(Concert concert) {

		return concert.getAdvancedReservation() != null ?
			concert.getAdvancedReservation() : concert.getReservation();
	}

	private boolean isAdvancedReservationToday(Concert concert) {

		LocalDateTime advancedReservation = concert.getAdvancedReservation();
		if (advancedReservation == null) {
			return false;
		}

		LocalDateTime now = LocalDateTime.now();
		return isSameDay(advancedReservation, now);
	}

	private boolean isAdvancedReservationSoon(Concert concert) {

		LocalDateTime advancedReservation = concert.getAdvancedReservation();
		if (advancedReservation == null) {
			return false;
		}

		LocalDateTime now = LocalDateTime.now();
		LocalDateTime soon = now.plusMinutes(90); // 90분 이내

		return advancedReservation.isAfter(now) && advancedReservation.isBefore(soon);
	}

	private boolean isSameDay(LocalDateTime date1, LocalDateTime date2) {
		return date1.toLocalDate().equals(date2.toLocalDate());
	}
}


