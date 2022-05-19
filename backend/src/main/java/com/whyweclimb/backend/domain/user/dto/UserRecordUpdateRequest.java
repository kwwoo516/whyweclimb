package com.whyweclimb.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserRecordUpdateRequest {
    private Integer userSeq;
    private Integer maxLevel;
    private Integer record;
}
