package com.conkiri.domain.chatbot.dto.response;

import java.util.List;
import java.util.Map;

// 간소화된 ChatResponseDTO
public record ChatbotResponseDTO(
        String answer,
        boolean hasEvidenceImage,
        String evidenceImageData
) {
    public static ChatbotResponseDTO from(Map<String, Object> pythonResponse) {
        String answer = (String) pythonResponse.get("answer");
        boolean hasEvidenceImage = (boolean) pythonResponse.get("has_evidence_image");
        String evidenceImageData = (String) pythonResponse.get("evidence_image_data");

        return new ChatbotResponseDTO(
                answer,
                hasEvidenceImage,
                evidenceImageData
        );
    }
}