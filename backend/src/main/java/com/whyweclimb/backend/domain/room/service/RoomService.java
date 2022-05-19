package com.whyweclimb.backend.domain.room.service;

import com.whyweclimb.backend.domain.room.dto.RoomCreateRequest;
import com.whyweclimb.backend.domain.room.dto.RoomInfoResponse;

public interface RoomService {
	// 방생성
	RoomInfoResponse createRoom(RoomCreateRequest request);
	// 방 코드 입력 후 정보 받아서 들어가기 
	RoomInfoResponse findRoom(String roomCode);
	// 방 맞는 조건으로 랜덤하게 검색해서 들어가기
	RoomInfoResponse joinRoom(boolean interference);
	// 방 삭제하기 
	boolean deleteRoom(String roomCode);
	// 게임 시작
	RoomInfoResponse startGame(String roomCode);
}
