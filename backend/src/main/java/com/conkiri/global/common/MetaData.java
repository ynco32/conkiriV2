package com.conkiri.global.common;

import java.time.LocalDateTime;

import lombok.Getter;

@Getter
public class MetaData {

	private LocalDateTime timestamp;

	public MetaData() {
		this.timestamp = LocalDateTime.now();
	}
}
