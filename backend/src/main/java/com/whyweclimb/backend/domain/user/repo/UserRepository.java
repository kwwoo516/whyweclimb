package com.whyweclimb.backend.domain.user.repo;

import com.whyweclimb.backend.domain.user.dto.UserInfoResponse;
import com.whyweclimb.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
	boolean existsByUserId(String userId);
	Optional<UserInfoResponse> findByUserIdAndUserPassword(String userId, String userPassword);
	Optional<UserInfoResponse> findByUserId(String userId);
}
