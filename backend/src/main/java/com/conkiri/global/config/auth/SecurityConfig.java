package com.conkiri.global.config.auth;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.conkiri.global.auth.oauth.OAuth2UserService;
import com.conkiri.global.auth.service.handler.OAuth2FailureHandler;
import com.conkiri.global.auth.service.handler.OAuth2SuccessHandler;
import com.conkiri.global.auth.token.JwtAuthenticationFilter;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.ApiResponseUtil;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final ApiResponseUtil apiResponseUtil;
	private final OAuth2UserService oAuth2UserService;
	private final OAuth2SuccessHandler oAuth2SuccessHandler;
	private final OAuth2FailureHandler oAuth2FailureHandler;
	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	@Value("${frontend.url}")
	private String frontendUrl;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			.csrf(csrf -> csrf.disable())
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			//세션 비활성화
			.sessionManagement(session ->
				session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			)
			//요청 권한 설정
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/api/v1/auth/**", "/api/v1/oauth2/**", "/error").permitAll()
				.requestMatchers("/api/v1/arena/**", "/api/v1/view/arenas/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/v1/view/reviews/**").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/v1/concerts/create").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/v1/concerts/checkExists").permitAll()
				.requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")
				.anyRequest().authenticated()
			)
			.oauth2Login(oauth2 -> oauth2
				.authorizationEndpoint(endpoint ->
					endpoint.baseUri("/api/v1/oauth2/authorization")
				)
				.redirectionEndpoint(redirect ->
					redirect.baseUri("/api/v1/oauth2/code/*")
				)
				.userInfoEndpoint(userInfo ->
					userInfo.userService(oAuth2UserService)
				)
				.successHandler(oAuth2SuccessHandler)
				.failureHandler(oAuth2FailureHandler)
			)
			//JWT 필터가 UsernamePasswordAuthenticationFilter 전에 실행되도록 지정, 비번 검증 전에 토큰의 유효성 검증
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
			// 인증 실패 핸들러 설정
            .exceptionHandling(handling -> handling
			.authenticationEntryPoint((request, response, authException) -> {
				// JWT 인증 실패 시 401 반환
				apiResponseUtil.writeErrorResponse(
					response,
					HttpServletResponse.SC_UNAUTHORIZED,
					ErrorCode.UNAUTHORIZED_ACCESS.name(),
					ErrorCode.UNAUTHORIZED_ACCESS.getMessage()
				);
			})
				// 권한 부족 핸들러 (403 에러)

			.accessDeniedHandler((request, response, accessDeniedException) -> {
				apiResponseUtil.writeErrorResponse(
					response,
					HttpServletResponse.SC_FORBIDDEN,
					ErrorCode.ACCESS_DENIED.name(),
					ErrorCode.ACCESS_DENIED.getMessage()
				);
			})
		);
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList(frontendUrl, "http://localhost:3000")); // 프론트엔드 도메인
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setAllowCredentials(true);
		// 쿠키 및 Authorization 헤더 노출 허용
		configuration.setExposedHeaders(Arrays.asList("Authorization"));

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

}
