package com.conkiri.global.util;

import java.io.IOException;

import org.springframework.stereotype.Component;

import com.conkiri.global.common.ApiResponse;
import com.conkiri.global.common.ExceptionResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApiResponseUtil {

	private final ObjectMapper objectMapper;

	public void writeErrorResponse(HttpServletResponse response, int status, String code, String message) {
		try {
			response.setStatus(status);
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");

			ExceptionResponse error = new ExceptionResponse(status, code, message);
			ApiResponse<Void> apiResponse = ApiResponse.fail(error);

			String body = objectMapper.writeValueAsString(apiResponse);
			response.getWriter().write(body);
		} catch (IOException e) {
			log.error("응답 바디 작성 실패", e);
		}
	}
}
