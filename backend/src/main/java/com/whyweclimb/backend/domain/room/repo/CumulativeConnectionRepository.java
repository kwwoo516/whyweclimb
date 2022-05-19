package com.whyweclimb.backend.domain.room.repo;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.whyweclimb.backend.entity.CumulativeConnection;

@Repository
public interface CumulativeConnectionRepository extends JpaRepository<CumulativeConnection, Integer> {
	Optional<CumulativeConnection> findByConnectionDate(LocalDate connectionDate);
	
}
