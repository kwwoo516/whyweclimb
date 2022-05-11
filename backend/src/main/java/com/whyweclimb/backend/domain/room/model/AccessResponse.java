package com.whyweclimb.backend.domain.room.model;

import java.util.List;

import com.whyweclimb.backend.entity.Access;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AccessResponse {
	private List<Access> data;
	private String message;

}
