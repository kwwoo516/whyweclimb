package com.whyweclimb.backend.domain.room.repo;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.whyweclimb.backend.entity.SimultaneousConnection;

@Repository
public interface SimultaneousConnectionRepository extends JpaRepository<SimultaneousConnection, Integer> {
	Optional<SimultaneousConnection> findByConnectionDate(LocalDate connectionDate);
	
}
