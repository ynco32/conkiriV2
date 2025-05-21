package com.conkiri.domain.chatbot.controller;

import com.conkiri.domain.chatbot.dto.request.ChatRequestDTO;
import com.conkiri.domain.chatbot.dto.response.ChatbotResponseDTO;
import com.conkiri.domain.chatbot.service.ChatbotService;
import com.conkiri.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping
    public ApiResponse<ChatbotResponseDTO> chat(@Valid @RequestBody ChatRequestDTO request) {
        return ApiResponse.success(chatbotService.processQuery(request));
    }

    @GetMapping("/health")
    public ApiResponse<String> healthCheck() {
        return chatbotService.getHealthStatus();
    }
}