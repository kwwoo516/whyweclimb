package com.whyweclimb.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserUpdateRequest {
    private Integer userSeq;
    private Integer backgroundSound;
    private Integer effectSound;
    private Integer maxLevel;
    private Integer skinSeq;

}
