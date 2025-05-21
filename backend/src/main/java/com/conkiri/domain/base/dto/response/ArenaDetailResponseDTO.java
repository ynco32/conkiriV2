package com.conkiri.domain.base.dto.response;

import com.conkiri.domain.base.entity.Arena;

public record ArenaDetailResponseDTO(
	Long arenaId,
	String arenaName,
	String arenaEngName,
	String address,
	Double latitude,
	Double longitude,
	String photoUrl
) {
	public static ArenaDetailResponseDTO from(Arena arena) {
		return new ArenaDetailResponseDTO(
			arena.getArenaId(),
			arena.getArenaName(),
			arena.getArenaEngName(),
			arena.getAddress(),
			arena.getLatitude(),
			arena.getLongitude(),
			arena.getPhotoUrl()
		);
	}
}
