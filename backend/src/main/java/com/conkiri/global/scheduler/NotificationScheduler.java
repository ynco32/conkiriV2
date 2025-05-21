package com.conkiri.global.scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.entity.Artist;
import com.conkiri.domain.base.entity.Cast;
import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.repository.CastRepository;
import com.conkiri.domain.notification.entity.MyArtist;
import com.conkiri.domain.notification.entity.MyConcert;
import com.conkiri.domain.notification.entity.NotificationType;
import com.conkiri.domain.notification.repository.MyArtistRepository;
import com.conkiri.domain.notification.repository.MyConcertRepository;
import com.conkiri.domain.notification.repository.NotificationRepository;
import com.conkiri.domain.notification.service.NotificationSendService;
import com.conkiri.domain.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

	private final MyConcertRepository myConcertRepository;
	private final MyArtistRepository myArtistRepository;
	private final CastRepository castRepository;
	private final NotificationRepository notificationRepository;
	private final NotificationSendService notificationSendService;


	@Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
	@Transactional
	public void sendTicketingDayNotifications() {

		log.info("티켓팅 당일 알림 스케줄러 실행");
		LocalDate today = LocalDate.now();
		LocalDateTime startOfDay = today.atStartOfDay();
		LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

		List<Object[]> userConcertPairs = myConcertRepository.findUsersForTicketingNotification(startOfDay, endOfDay);

		for (Object[] pair : userConcertPairs) {
			User user = (User) pair[0];
			Concert concert = (Concert) pair[1];

			if (!isNotificationAlreadySent(user, concert, NotificationType.TICKETING_DAY)) {
				notificationSendService.sendTicketingNotification(user, concert, NotificationType.TICKETING_DAY);
			}
		}
	}

	@Scheduled(fixedDelay = 1800000)
	@Transactional
	public void sendTicketingSoonNotifications() {

		LocalDateTime now = LocalDateTime.now();
		LocalDateTime startTime = now.plusMinutes(75);
		LocalDateTime endTime = now.plusMinutes(105);

		List<Object[]> userConcertPairs = myConcertRepository.findUsersForTicketingNotification(startTime, endTime);

		for (Object[] pair : userConcertPairs) {
			User user = (User) pair[0];
			Concert concert = (Concert) pair[1];

			if (!isNotificationAlreadySent(user, concert, NotificationType.TICKETING_SOON)) {
				notificationSendService.sendTicketingNotification(user, concert, NotificationType.TICKETING_SOON);
			}
		}
	}

	@Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
	@Transactional
	public void sendConcertDayNotifications() {

		log.info("공연 당일 알림 스케줄러 실행");

		LocalDate today = LocalDate.now();
		LocalDateTime startOfDay = today.atStartOfDay();
		LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

		List<MyConcert> myConcerts = myConcertRepository.findForEntranceNotification(startOfDay, endOfDay);

		for (MyConcert myConcert : myConcerts) {
			if (!isNotificationAlreadySent(myConcert.getUser(), myConcert.getConcert(), NotificationType.CONCERT_DAY)) {
				notificationSendService.sendEntranceNotification(
					myConcert.getUser(),
					myConcert.getConcert(),
					myConcert.getConcertDetail(),
					NotificationType.CONCERT_DAY
				);
			}
		}
	}

	@Scheduled(fixedDelay = 1800000)
	@Transactional
	public void sendConcertSoonNotifications() {

		LocalDateTime now = LocalDateTime.now();
		LocalDateTime startTime = now.plusMinutes(45);
		LocalDateTime endTime = now.plusMinutes(75);

		List<MyConcert> myConcerts = myConcertRepository.findForEntranceNotification(startTime, endTime);

		for (MyConcert myConcert : myConcerts) {
			if (!isNotificationAlreadySent(myConcert.getUser(), myConcert.getConcert(), NotificationType.CONCERT_SOON)) {
				notificationSendService.sendEntranceNotification(
					myConcert.getUser(),
					myConcert.getConcert(),
					myConcert.getConcertDetail(),
					NotificationType.CONCERT_SOON
				);
			}
		}
	}


	@Transactional
	public void sendConcertOpenNotifications(Concert concert) {

		log.info("공연 오픈 알림 실행: {}", concert.getConcertName());
		List<Cast> casts = castRepository.findByConcertWithArtist(concert);
		List<Artist> artists = casts.stream()
			.map(Cast::getArtist)
			.distinct()
			.toList();

		log.info("콘서트 관련 아티스트 수: {}", artists.size());
		List<MyArtist> myArtists = myArtistRepository.findByArtistInWithUser(artists);
		Set<User> uniqueUsers = new HashSet<>();
		for (MyArtist myArtist : myArtists) {
			uniqueUsers.add(myArtist.getUser());
		}

		log.info("알림 발송 대상 사용자 수: {}", uniqueUsers.size());

		// 4. 각 사용자에게 한 번만 알림 발송
		for (User user : uniqueUsers) {
			// 알림이 이미 발송되었는지 확인
			if (!notificationRepository.existsByUserAndConcertAndNotificationType(
				user, concert, NotificationType.CONCERT_OPEN)) {

				log.info("알림 발송: userId={}, concertId={}", user.getUserId(), concert.getConcertId());
				notificationSendService.sendTicketingNotification(
					user, concert, NotificationType.CONCERT_OPEN);
			} else {
				log.info("이미 알림 발송됨: userId={}, concertId={}", user.getUserId(), concert.getConcertId());
			}
		}
	}

	private boolean isNotificationAlreadySent(User user, Concert concert, NotificationType type) {
		return notificationRepository.existsByUserAndConcertAndNotificationType(user, concert, type);
	}
}
