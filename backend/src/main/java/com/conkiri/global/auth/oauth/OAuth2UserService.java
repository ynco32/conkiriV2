package com.conkiri.global.auth.oauth;

import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.repository.UserRepository;
import com.conkiri.domain.user.service.UserService;
import com.conkiri.global.auth.entity.Auth;
import com.conkiri.global.auth.repository.AuthRepository;
import com.conkiri.global.auth.token.UserPrincipal;
import com.conkiri.global.util.MapUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

	private final UserRepository userRepository;
	private final AuthRepository authRepository;
	private final UserService userService;

	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
		OAuth2User oauth2User = super.loadUser(userRequest);

		String provider = userRequest.getClientRegistration().getRegistrationId();  // "kakao"
		String providerId = oauth2User.getName();  // OAuth2 제공자의 고유 ID

		Map<String, Object> attributes = oauth2User.getAttributes();
		Map<String, Object> kakaoAccount = MapUtil.cast(attributes.get("kakao_account"), Map.class);
		Map<String, Object> profile = MapUtil.cast(kakaoAccount.get("profile"), Map.class);

		String email = (String) kakaoAccount.get("email");
		String nickname = (String) profile.get("nickname");

		User user = findOrCreateUser(email, nickname);
		findOrCreateAuth(user, provider, providerId);
		return new UserPrincipal(oauth2User, user);
	}

	private User findOrCreateUser(String email, String nickname) {
		return userRepository.findByEmail(email)
			.orElseGet(() -> createUser(email, nickname));
	}

	private User createUser(String email, String nickname) {
		User user = User.of(email, nickname, null);
		user = userRepository.save(user);
		userService.createAndSetAnonymNickname(user);
		return userRepository.save(user);
	}

	private void findOrCreateAuth(User user, String provider, String providerId) {
		if (!authRepository.existsByUser(user)) {
			createAuth(user, provider, providerId);
		}
	}

	private Auth createAuth(User user, String provider, String providerId) {
		Auth auth = Auth.of(null, null, user, provider, providerId);
		return authRepository.save(auth);
	}

}
