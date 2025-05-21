package com.conkiri.global.auth.service.handler;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.ApiResponseUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler implements AuthenticationFailureHandler {

	private final ApiResponseUtil apiResponseUtil;

	@Override
	public void onAuthenticationFailure(HttpServletRequest request,
		HttpServletResponse response,
		AuthenticationException exception){

		log.error("OAuth2 failure: {}", exception.getMessage());
		log.info("Original State: {}", request.getSession().getAttribute("OAUTH2_STATE"));
		log.info("Received State: {}", request.getParameter("state"));
		log.info("Code: {}", request.getParameter("code"));
		log.info("Error: {}", request.getParameter("error"));

		apiResponseUtil.writeErrorResponse(
			response,
			HttpServletResponse.SC_UNAUTHORIZED,
			ErrorCode.OAUTH2_FAILURE.name(),
			ErrorCode.OAUTH2_FAILURE.getMessage()
		);
	}
}