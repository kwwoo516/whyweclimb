package com.whyweclimb.backend.domain.room.controller;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;

import com.whyweclimb.backend.domain.room.dto.RoomCreateRequest;
import com.whyweclimb.backend.domain.room.dto.RoomInfoResponse;
import com.whyweclimb.backend.domain.room.service.RoomService;

import io.swagger.annotations.ApiOperation;

@RequiredArgsConstructor
@RestController
@RequestMapping("/room")
public class RoomController {
    private final RoomService roomService;
	private final SimpMessageSendingOperations messagingTemplate;

	@ApiOperation(value = "createRoom", notes = "채팅방 생성, 성공 시 roomCode를 반환합니다.")
    @PostMapping("")
    public ResponseEntity<Map<String, String>> createRoom(@RequestBody RoomCreateRequest request){
    	RoomInfoResponse response = roomService.createRoom(request);
		String roomCode = "";
		HttpStatus status;
		if(response == null) {
			status = HttpStatus.NOT_ACCEPTABLE;
		}else { 
			roomCode = response.getRoomCode();
			status = HttpStatus.CREATED;
		}
		Map<String, String> result = new HashMap<String, String>();
		result.put("roomCode", roomCode);
		return new ResponseEntity<Map<String, String>>(result, status);
    }

	@ApiOperation(value = "findRoom", notes = 
		"roomCode를 받아 게임방 정보를 반환합니다. FindResult에 방이 없다면 [none], 인원제한은 [full], 시작이후라면 [start], 접속가능하다면 [ok]를 반환합니다.")
    @GetMapping("/{roomCode}")
    public ResponseEntity<RoomInfoResponse> findRoomUseCode(@PathVariable String roomCode){
    	RoomInfoResponse response = roomService.findRoom(roomCode);
		HttpStatus status;
		if(response == null) {
			response = RoomInfoResponse.builder()
					.roomFindResult("none").build();
			status = HttpStatus.NO_CONTENT;
		}else { 
			status = HttpStatus.OK;
		}
		return new ResponseEntity<RoomInfoResponse>(response, status);
    }

	@ApiOperation(value = "joinRoom", notes = 
		"roomInterference를 받아 방을 반환합니다. 생성한지 오래된 방을 반환하며 없다면 null과 204, 있다면 방정보와 200을 반환합니다.")
    @GetMapping("")
    public ResponseEntity<RoomInfoResponse> joinRoomRandom(@RequestParam boolean roomInterference){
    	RoomInfoResponse response = roomService.joinRoom(roomInterference);
		HttpStatus status;
		if(response == null) {
			status = HttpStatus.NO_CONTENT;
		}else { 
			status = HttpStatus.OK;
		}
		return new ResponseEntity<RoomInfoResponse>(response, status);
    }


	@ApiOperation(value = "startGame", notes = "방을 게임시작 상태로 변환 후 반환합니다.")
    @PutMapping("/start/{roomCode}")
    public ResponseEntity<RoomInfoResponse> startGame(@PathVariable String roomCode){
    	RoomInfoResponse response = roomService.startGame(roomCode);
    	HttpStatus status;
    	if(response == null) {
    		status = HttpStatus.NOT_ACCEPTABLE;
    	}else { 
    		status = HttpStatus.OK;
    	}
    	
    	Map<String, String> message = new HashMap<String, String>();
    	message.put("message", "start");
    	messagingTemplate.convertAndSend("/sub/room/" + roomCode, message);
    	return new ResponseEntity<RoomInfoResponse>(response, status);
    }
}