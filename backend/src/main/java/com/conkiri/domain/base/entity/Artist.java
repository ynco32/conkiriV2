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
public class Artist {

    @Id
    @Column(name = "artist_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long artistId;

    @Column(name = "artist_name", length = 100)
    private String artistName;

    @Column(name = "artist_eng_name", length = 100)
    private String artistEngName;

    @Column(name = "photo_url", length = 200)
    private String photoUrl;

    private Artist(String artistName, String artistEngName, String photoUrl) {
        this.artistName = artistName;
        this.artistEngName = artistEngName;
        this.photoUrl = photoUrl;
    }

    public static Artist of(String artistName, String artistEngName, String photoUrl) {
        return new Artist(artistName, artistEngName, photoUrl);
    }
}
