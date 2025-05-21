package com.conkiri.global.exception;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.conkiri.global.common.ApiResponse;
import com.conkiri.global.common.ExceptionResponse;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final String BAD_REQUEST = "BAD_REQUEST";

	// javax.validation.Valid or @Validated 으로 binding error 발생시 발생
	// 주로 @RequestBody, @RequestPart 어노테이션에서 발생
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ApiResponse<Void> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {

		log.warn("요청 바디 검증 실패: {}", e.getMessage());
		String defaultMessage = Optional.ofNullable(e.getBindingResult().getFieldError())
			.map(FieldError::getDefaultMessage)
			.orElse("요청 데이터가 유효하지 않습니다.");

		ExceptionResponse exceptionResponse = new ExceptionResponse(HttpStatus.BAD_REQUEST.value(), BAD_REQUEST, defaultMessage);
		return ApiResponse.fail(exceptionResponse);
	}

	// @ModelAttribute 으로 binding error 발생시 BindException 발생
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(BindException.class)
	public ApiResponse<Void> handleBindException(BindException e) {

		log.warn("요청 파라미터 바인딩 실패: {}", e.getMessage());
		String defaultMessage = Optional.ofNullable(e.getBindingResult().getFieldError())
			.map(FieldError::getDefaultMessage)
			.orElse("요청 데이터가 유효하지 않습니다.");

		ExceptionResponse exceptionResponse = new ExceptionResponse(HttpStatus.BAD_REQUEST.value(), BAD_REQUEST, defaultMessage);
		return ApiResponse.fail(exceptionResponse);
	}

	// enum type 일치하지 않아 binding 못할 경우 발생
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ApiResponse<Void> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
		log.warn("요청 파라미터 타입 불일치. 파라미터명: {}, 오류: {}", e.getName(), e.getMessage());
		ExceptionResponse exceptionResponse = new ExceptionResponse(HttpStatus.BAD_REQUEST.value(), BAD_REQUEST, "요청 파라미터 타입이 올바르지 않습니다.");
		return ApiResponse.fail(exceptionResponse);
	}

	// 지원하지 않은 HTTP method 호출 할 경우 발생
	@ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ApiResponse<Void> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
		log.warn("지원하지 않는 HTTP 메서드 호출: {}. 오류: {}", e.getMethod(), e.getMessage());
		ExceptionResponse exceptionResponse = new ExceptionResponse(HttpStatus.METHOD_NOT_ALLOWED.value(), "METHOD_NOT_ALLOWED", "지원하지 않는 HTTP 메서드입니다.");
		return ApiResponse.fail(exceptionResponse);
	}

	// request 값을 읽을 수 없을 때 발생
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ApiResponse<Void> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
		log.warn("HTTP 메시지를 읽는 도중 오류 발생: {}", e.getMessage());
		ExceptionResponse exceptionResponse = new ExceptionResponse(HttpStatus.BAD_REQUEST.value(), BAD_REQUEST,  "요청 바디가 올바르지 않습니다.");
		return ApiResponse.fail(exceptionResponse);
	}

	// 비즈니스 로직 에러
	@ExceptionHandler(BaseException.class)
	public ApiResponse<Void> handleBaseException(BaseException e) {
		log.error("비즈니스 로직 처리 중 오류 발생. 에러 코드: {}, 메시지: {}", e.getErrorCode(), e.getMessage());
		ErrorCode errorCode = e.getErrorCode();

		ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
		HttpServletResponse response = attributes != null ? attributes.getResponse() : null;
		if (response != null) {
			response.setStatus(errorCode.getHttpStatus().value());
		}

		ExceptionResponse exceptionResponse = new ExceptionResponse(errorCode.getHttpStatus().value(), errorCode.name(), errorCode.getMessage());
		return ApiResponse.fail(exceptionResponse);
	}
}