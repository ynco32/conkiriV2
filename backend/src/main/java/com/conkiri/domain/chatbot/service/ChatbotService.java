package com.conkiri.domain.chatbot.service;

import com.conkiri.domain.chatbot.dto.request.ChatRequestDTO;
import com.conkiri.domain.chatbot.dto.response.ChatbotResponseDTO;
import com.conkiri.global.common.ApiResponse;
import com.conkiri.global.common.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final RestTemplate restTemplate;

    @Value("${chatbot.python.url}")
    private String pythonServiceUrl;

    /**
     * 사용자 질의를 처리하고 챗봇 응답을 반환합니다.
     */
    public ChatbotResponseDTO processQuery(ChatRequestDTO request) {
        try {
            log.info("챗봇 질의 요청: query='{}', concertId={}", request.query(), request.concertId());

            String apiUrl = pythonServiceUrl + "/api/chatbot";

            // 요청 본문 구성 (Python 서버에 맞춰 snake_case 사용)
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", request.query());
            requestBody.put("concert_id", request.concertId());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            // API 호출
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(
                    apiUrl,
                    requestEntity,
                    Map.class
            );

            // 응답 변환
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = responseEntity.getBody();

            if (responseBody == null) {
                log.error("챗봇 서버에서 빈 응답을 반환했습니다.");
                return createErrorResponse("챗봇 서버 응답 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            }

            ChatbotResponseDTO response = ChatbotResponseDTO.from(responseBody);
            log.info("챗봇 응답 완료: hasEvidenceImage={}", response.hasEvidenceImage());

            if (response.hasEvidenceImage() && response.evidenceImageData() != null) {
                log.debug("이미지 데이터 크기: {} 바이트", response.evidenceImageData().length());
            }

            return response;

        } catch (RestClientException e) {
            log.error("챗봇 서버 통신 중 오류 발생", e);
            return createErrorResponse("챗봇 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } catch (Exception e) {
            log.error("챗봇 질의 처리 중 예상치 못한 오류 발생", e);
            return createErrorResponse("서비스 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    /**
     * 오류 발생 시 기본 응답을 생성합니다.
     */
    private ChatbotResponseDTO createErrorResponse(String errorMessage) {
        return new ChatbotResponseDTO(
                errorMessage,
                false,
                null
        );
    }

    /**
     * 챗봇 서버의 건강 상태를 확인하고 적절한 응답 객체를 반환합니다.
     */
    public ApiResponse<String> getHealthStatus() {
        try {
            String healthUrl = pythonServiceUrl + "/chatbot/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(healthUrl, Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = response.getBody();

            boolean isHealthy = responseBody != null && "healthy".equals(responseBody.get("status"));

            if (isHealthy) {
                return ApiResponse.success("챗봇 서버가 정상 작동 중입니다.");
            } else {
                ExceptionResponse error = new ExceptionResponse(
                        HttpStatus.SERVICE_UNAVAILABLE.value(),
                        "SERVICE_UNAVAILABLE",
                        "챗봇 서버가 비정상 상태입니다."
                );
                return ApiResponse.fail(error);
            }
        } catch (Exception e) {
            log.error("챗봇 서버 상태 확인 중 오류", e);

            ExceptionResponse error = new ExceptionResponse(
                    HttpStatus.SERVICE_UNAVAILABLE.value(),
                    "SERVICE_UNAVAILABLE",
                    "챗봇 서버 연결에 실패했습니다: " + e.getMessage()
            );
            return ApiResponse.fail(error);
        }
    }
}