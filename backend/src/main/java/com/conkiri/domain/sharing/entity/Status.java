package com.conkiri.domain.sharing.entity;

import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum Status {
	UPCOMING("UPCOMING", "나눔 시작 전"),
	ONGOING("ONGOING", "나눔 중"),
	CLOSED("CLOSED", "나눔 완료");

	private final String value;
	private final String responseValue;

	public static Status from(String status) {
		try {
			return Status.valueOf(status);
		} catch (IllegalArgumentException e) {
			throw new BaseException(ErrorCode.STATUS_INVALID);
		}
	}
}
