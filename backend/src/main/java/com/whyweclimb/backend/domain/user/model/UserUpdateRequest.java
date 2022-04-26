package com.whyweclimb.backend.domain.user.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserUpdateRequest {
    private String userId;
    private String userPassword;
    private Integer backgroundSound;
    private Integer effectSound;
}
