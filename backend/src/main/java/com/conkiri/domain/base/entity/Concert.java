package com.conkiri.domain.base.entity;

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
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Concert {

    @Id
    @Column(name = "concert_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long concertId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arena_id")
    private Arena arena;

    @Column(name = "concert_name", length = 100)
    private String concertName;

    @Column(name = "advanced_reservation")
    private LocalDateTime advancedReservation;

    @Column(name = "reservation")
    private LocalDateTime reservation;

    @Enumerated(EnumType.STRING)
    @Column(name = "ticketing_platform")
    private Platform ticketingPlatform;

    @Column(name = "photo_url", length = 200)
    private String photoUrl;

    //생성자
    private Concert(Arena arena, String concertName, LocalDateTime advancedReservation, LocalDateTime reservation, Platform ticketingPlatform, String photoUrl) {
        this.arena = arena;
        this.concertName = concertName;
        this.advancedReservation = advancedReservation;
        this.reservation = reservation;
        this.ticketingPlatform = ticketingPlatform;
        this.photoUrl = photoUrl;
    }

    public static Concert of(Arena arena, String concertName, LocalDateTime advancedReservation, LocalDateTime reservation, Platform ticketingPlatform, String photoUrl) {
        return new Concert(arena, concertName, advancedReservation, reservation, ticketingPlatform, photoUrl);
    }

}
