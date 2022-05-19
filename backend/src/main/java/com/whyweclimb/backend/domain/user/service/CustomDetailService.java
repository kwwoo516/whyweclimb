package com.whyweclimb.backend.domain.user.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.whyweclimb.backend.domain.user.dto.UserInfoResponse;
import com.whyweclimb.backend.domain.user.repo.UserRepository;
import com.whyweclimb.backend.entity.User;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class CustomDetailService implements UserDetailsService{

	private final UserRepository userRepository;
	
	@Override
	public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
		UserInfoResponse response = userRepository.findByUserId(userId)
				.orElseThrow(() -> new UsernameNotFoundException("Not Found User By username : " + userId));
		
		return toUser(response);
	}
	
	private static User toUser(UserInfoResponse response) {
		return User.builder()
				.userSeq(response.getUserSeq())
				.userId(response.getUserId())
				.backgroundSound(response.getBackgroundSound())
				.effectSound(response.getEffectSound())
				.build();
	}

}
