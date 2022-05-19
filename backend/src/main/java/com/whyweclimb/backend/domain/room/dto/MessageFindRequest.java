package com.whyweclimb.backend.domain.room.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@Builder
@ToString
public class MessageFindRequest {
	private Integer id;
	private String sender;
}
