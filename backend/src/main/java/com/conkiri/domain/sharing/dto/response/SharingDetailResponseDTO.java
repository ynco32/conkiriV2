package com.conkiri.domain.sharing.dto.response;

import com.conkiri.domain.sharing.entity.Sharing;

public record SharingDetailResponseDTO(
	Long sharingId,
	String title,
	String content,
	String photoUrl,
	String status,
	String startTime,
	String writer,
	Long writerId,
	//String writerLevel,
	Double latitude,
	Double longitude,
	Long concertId
) {
	public static SharingDetailResponseDTO from(Sharing sharing) {
		return new SharingDetailResponseDTO(
			sharing.getSharingId(),
			sharing.getTitle(),
			sharing.getContent(),
			sharing.getPhotoUrl(),
			sharing.getStatus().name(),
			sharing.getStartTime().toString(),
			sharing.getUser().getNickname(),
			sharing.getUser().getUserId(),
			// sharing.getUser().getLevel(),
			sharing.getLatitude(),
			sharing.getLongitude(),
			sharing.getConcert().getConcertId()
		);
	}
}