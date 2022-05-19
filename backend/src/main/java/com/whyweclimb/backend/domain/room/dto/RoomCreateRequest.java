package com.whyweclimb.backend.domain.room.dto;

import java.util.UUID;

import com.whyweclimb.backend.entity.Room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class RoomCreateRequest {
    private Boolean roomPrivate;
    private Boolean roomInterference;
    private Integer roomMaxNum;
    
    public static Room toEntity(RoomCreateRequest request){
        return Room.builder()
    			.roomCode(UUID.randomUUID().toString().substring(24))
    			.roomPrivate(request.roomPrivate)
    			.roomInterference(request.roomInterference)
    			.roomMaxNum(request.roomMaxNum)
    			.roomStart(false)
    			.build();
    }
}
