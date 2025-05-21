package com.conkiri.global.exception;

public final class ValidationMessage {

	private ValidationMessage() {}

	//입력
	public static final String BLANK_IS_NOT_ALLOWED = "내용을 입력해주세요.";
	public static final String NULL_IS_NOT_ALLOWED = "필수값입니다.";

	//닉네임
	public static final String NICKNAME_NOT_EMPTY = "닉네임은 필수값 입니다.";
	public static final String ERROR_NICKNAME_LENGTH = "닉네임은 2자 이상 10자 이하여야 합니다.";
	public static final String ERROR_NICKNAME_FORMAT = "닉네임은 공백 없이 한글, 영문, 숫자만 가능합니다.";

}
