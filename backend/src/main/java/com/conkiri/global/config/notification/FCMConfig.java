package com.conkiri.global.config.notification;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@Profile("fcm")
public class FCMConfig {

	@Value("${firebase.project-id}")
	private String projectId;

	@Value("${firebase.private-key}")
	private String privateKey;

	@Value("${firebase.client-email}")
	private String clientEmail;

	@Value("${firebase.private-key-id}")
	private String privateKeyId;

	@Value("${firebase.client-id}")
	private String clientId;

	@PostConstruct
	public void initialize() {
		try {
			log.info("Firebase 초기화 시작");

			if (FirebaseApp.getApps().isEmpty()) {

				String credentialsJson = createCredentialsJson();

				GoogleCredentials credentials = GoogleCredentials.fromStream(
					new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8))
				);

				FirebaseOptions options = FirebaseOptions.builder()
					.setCredentials(credentials)
					.setProjectId(projectId)
					.build();

				FirebaseApp.initializeApp(options);
				log.info("Firebase 초기화 완료");
			}
		} catch (Exception e) {
			log.error("Firebase 초기화 실패: {}", e.getClass().getName());
		}
	}

	private String createCredentialsJson() throws JsonProcessingException {

		String newPrivateKey = "-----BEGIN PRIVATE KEY-----\\n" + privateKey + "\\n-----END PRIVATE KEY-----\\n";
		String formattedPrivateKey = newPrivateKey.replace("\\n", "\n");

		Map<String, Object> credentialsMap = new HashMap<>();
		credentialsMap.put("type", "service_account");
		credentialsMap.put("project_id", projectId);
		credentialsMap.put("private_key_id", privateKeyId);
		credentialsMap.put("private_key", formattedPrivateKey);
		credentialsMap.put("client_email", clientEmail);
		credentialsMap.put("client_id", clientId);
		credentialsMap.put("auth_uri", "https://accounts.google.com/o/oauth2/auth");
		credentialsMap.put("token_uri", "https://oauth2.googleapis.com/token");

		ObjectMapper objectMapper = new ObjectMapper();
		return objectMapper.writeValueAsString(credentialsMap);
	}
}