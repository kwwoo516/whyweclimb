package com.whyweclimb.backend.domain.user.repo;

import com.whyweclimb.backend.entity.UserSkin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSkinRepository extends JpaRepository<UserSkin, Integer> {
}
