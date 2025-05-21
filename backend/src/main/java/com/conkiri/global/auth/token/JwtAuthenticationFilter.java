package com.conkiri.global.auth.token;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.repository.UserRepository;
import com.conkiri.global.auth.service.AuthService;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.ApiResponseUtil;
import com.conkiri.global.util.JwtUtil;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final UserRepository userRepository;
    private final ApiResponseUtil apiResponseUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (shouldNotFilter(request)) {
            filterChain.doFilter(request, response); //다음 필터로 제어를 넘김.
            return;
        }

        String token = jwtUtil.extractAccessToken(request);
        if (token == null) {
            apiResponseUtil.writeErrorResponse(
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    ErrorCode.AUTH_NOT_FOUND.name(),
                    ErrorCode.AUTH_NOT_FOUND.getMessage());
            return;
        }

        try {
            authenticateUserWithToken(token, request);
        } catch (ExpiredJwtException e) {
            log.info("AccessToken 만료됨. RefreshToken으로 재발급 시도");
            try {
                String newAccessToken = authService.refreshToken(request, response);
                request.setAttribute("access_token", newAccessToken);
                authenticateUserWithToken(newAccessToken, request);
                log.info("AccessToken 자동 재발급 완료");
            } catch (BaseException ex) {
                apiResponseUtil.writeErrorResponse(
                        response,
                        HttpServletResponse.SC_UNAUTHORIZED,
                        ex.getErrorCode().name(),
                        ex.getErrorCode().getMessage()
                );
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void authenticateUserWithToken(String token, HttpServletRequest request) throws BaseException {
        String email = jwtUtil.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        // 인증 정보 설정
        UserPrincipal userPrincipal = createUserPrincipal(user);
        setAuthentication(userPrincipal, request);
    }

    /*Spring Security는 SecurityContextHolder를 통해 현재 요청을 보낸 사용자가 누구인지 확인합니다.
    하지만 기본적으로 Spring Security는 세션 기반 인증을 사용하기 때문에,
    JWT 인증을 사용할 때는 인증된 사용자를 직접 SecurityContext에 등록해야 합니다.

    즉, 이 메서드가 없으면 JWT 검증은 성공하더라도, Spring Security가 사용자를 인식하지 못합니다.
    그러면 인증이 필요한 API 요청에서 403 Forbidden 오류가 발생할 수 있습니다.*/
    private UserPrincipal createUserPrincipal(User user) {
        return new UserPrincipal(
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole())),
                user
        );
    }

    private void setAuthentication(UserPrincipal userPrincipal, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userPrincipal,
                        null,
                        userPrincipal.getAuthorities()
                );

        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        if (path.startsWith("/api/v1/oauth2") ||
                path.equals("/api/v1/auth/refresh") ||
                path.startsWith("/api/v1/arena") ||
                path.startsWith("/api/v1/view/arenas") ||
                path.startsWith("/api/v1/concerts/create") ||
                path.startsWith("/api/v1/concerts/checkExists")) {
            return true;
        }

        if (path.startsWith("/api/v1/view/reviews") && "GET".equals(method)) {
            return true;
        }

        return false;
    }
}