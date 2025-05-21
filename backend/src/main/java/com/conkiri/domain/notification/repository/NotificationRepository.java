package com.conkiri.domain.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.notification.entity.Notification;
import com.conkiri.domain.notification.entity.NotificationType;
import com.conkiri.domain.user.entity.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {


	@Query("SELECT DISTINCT n FROM Notification n " +
		"LEFT JOIN FETCH n.concert " +
		"LEFT JOIN FETCH n.user " +
		"WHERE n.user = :user " +
		"ORDER BY n.createdAt DESC")
	List<Notification> findByUserWithConcertAndUser(@Param("user") User user);

	boolean existsByUserAndIsRead(User user, boolean isRead);

	@Modifying
	@Query("UPDATE Notification n SET n.isRead = true WHERE n.user = :user AND n.isRead = false")
	void markAllAsRead(@Param("user") User user);

	boolean existsByUserAndConcertAndNotificationType(User user, Concert concert, NotificationType type);

	void deleteAllByUser(User user);
}