package com.whyweclimb.backend.domain.user.repo;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.whyweclimb.backend.entity.SingleConnection;

@Repository
public interface SingleConnectionRepository extends JpaRepository<SingleConnection, Integer> {
	Optional<SingleConnection> findByConnectionDate(LocalDate connectionDate);
	
}
