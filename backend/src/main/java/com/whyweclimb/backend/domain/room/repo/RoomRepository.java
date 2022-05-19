package com.whyweclimb.backend.domain.room.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.whyweclimb.backend.domain.room.dto.RoomInfoResponse;
import com.whyweclimb.backend.entity.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
	Optional<Room> findByRoomCode(String roomCode);
	Optional<List<RoomInfoResponse>> findTop10ByRoomInterferenceTrueAndRoomPrivateFalseAndRoomStartFalseOrderByRoomSeqAsc();
	Optional<List<RoomInfoResponse>> findTop10ByRoomInterferenceFalseAndRoomPrivateFalseAndRoomStartFalseOrderByRoomSeqAsc();
	@Transactional
	Integer deleteByRoomCode(String roomCode);

}
