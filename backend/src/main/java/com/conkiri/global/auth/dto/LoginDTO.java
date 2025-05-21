package com.conkiri.global.auth.dto;

public record LoginDTO(
	Boolean authenticated,
	Boolean isNamed
) {
}
