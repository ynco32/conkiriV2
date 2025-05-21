package com.conkiri.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ExceptionResponse {

	private int statusCode;
	private String name;
	private String message;
}
