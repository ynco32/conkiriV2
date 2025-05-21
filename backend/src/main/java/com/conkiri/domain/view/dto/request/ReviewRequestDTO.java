package com.conkiri.domain.view.dto.request;

import java.util.List;

import com.conkiri.domain.view.entity.ArtistGrade;
import com.conkiri.domain.view.entity.ScreenGrade;
import com.conkiri.domain.view.entity.StageGrade;
import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.constraints.NotNull;

public record ReviewRequestDTO(
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) Long concertId,
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) String section,
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) String rowLine,
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) Long columnLine,
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) ArtistGrade artistGrade,
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) StageGrade stageGrade,
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) ScreenGrade screenGrade,
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) String content,
	String cameraBrand,
	String cameraModel,
	List<String> existingPhotoUrls
) {
}
