package com.whyweclimb.backend.domain.user.service;

import com.whyweclimb.backend.domain.room.repo.AccessRedisRepository;
import com.whyweclimb.backend.domain.user.dto.UserInfoResponse;
import com.whyweclimb.backend.domain.user.dto.UserRecordUpdateRequest;
import com.whyweclimb.backend.domain.user.dto.UserRequest;
import com.whyweclimb.backend.domain.user.dto.UserUpdateRequest;
import com.whyweclimb.backend.domain.user.repo.UserRepository;
import com.whyweclimb.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{
	private final UserRepository userRepository;
	private final AccessRedisRepository accessRedisRepository;
	
    @Override
	public UserInfoResponse createUser(UserRequest request) {
    	UserInfoResponse user = userRepository.existsByUserId(request.getUserId()) 
    			? null 
    			: new UserInfoResponse(userRepository.save(
					User.builder()
					.userId(request.getUserId())
					.userPassword(request.getUserPassword())
					.backgroundSound(50)
					.effectSound(50)
					.maxLevel(0)
					.skinSeq(1)
					.build()
					));
		return user;
	}

	@Override
	public boolean checkIdDuplicate(String userId) {
		return userRepository.existsByUserId(userId);
	}
	
	@Override
	public UserInfoResponse login(UserRequest request) {
		UserInfoResponse user = userRepository.findByUserIdAndUserPassword(request.getUserId(), request.getUserPassword()).orElse(null);
		
		if(accessRedisRepository.findByUserSeq(user.getUserSeq()) == null)
			return user;
		else 
			return new UserInfoResponse();
	}
	
	@Override
	public UserInfoResponse userInfo(String userId) {
		return userRepository.findByUserId(userId).orElse(null);
	}
	
	@Override
	public UserInfoResponse updateUser(UserUpdateRequest request) {
		Optional<User> user = userRepository.findById(request.getUserSeq());
		user.ifPresent(selectUser -> {
			userRepository.save(User.builder()
					.userSeq(selectUser.getUserSeq())
					.userId(selectUser.getUserId())
					.userPassword(selectUser.getUserPassword())
					.backgroundSound(request.getBackgroundSound())
					.effectSound(request.getEffectSound())
					.maxLevel(selectUser.getMaxLevel())
					.skinSeq(request.getSkinSeq())
					.build());
		});
		return new UserInfoResponse(user.orElse(null));
	}

	@Override
	public boolean checkSession(int userSeq) {
		if(accessRedisRepository.findByUserSeq(userSeq) == null)
			return true;
		else 
			return false;
	}
}