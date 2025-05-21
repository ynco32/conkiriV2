package com.conkiri.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

	private T data;

	private ExceptionResponse error;

	private MetaData meta;

	public static <T> ApiResponse<T> success(T data) {
		return new ApiResponse<>(data, null, new MetaData());
	}

	public static <T> ApiResponse<T> ofSuccess() {
		return new ApiResponse<>(null, null, new MetaData());
	}
	// 정적 메서드로 실패 응답 생성
	public static <T> ApiResponse<T> fail(ExceptionResponse error) {
		return new ApiResponse<>(null, error, new MetaData());
	}
}
