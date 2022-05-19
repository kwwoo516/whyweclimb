package com.whyweclimb.backend.domain.user.repo;

import com.whyweclimb.backend.entity.SingleRecord;
import com.whyweclimb.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SingleRecordRepository extends JpaRepository<SingleRecord, Integer> {
    Optional<SingleRecord> findByUserAndDate(User user, LocalDate date);
}
