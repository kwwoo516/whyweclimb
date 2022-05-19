package com.whyweclimb.backend.domain.user.service;

import com.whyweclimb.backend.domain.user.dto.UserRecordUpdateRequest;

public interface SingleGameService {

    boolean setUserRecord(UserRecordUpdateRequest request);
    void countSingleModeEntrance();
}
