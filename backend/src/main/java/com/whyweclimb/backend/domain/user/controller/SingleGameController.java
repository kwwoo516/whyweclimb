package com.whyweclimb.backend.domain.user.controller;

import com.whyweclimb.backend.domain.user.dto.UserRecordUpdateRequest;
import com.whyweclimb.backend.domain.user.service.SingleGameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/single")
public class SingleGameController {

    private final SingleGameService singleGameService;

    @PostMapping("/record")
    public ResponseEntity<Boolean> settingUserRecord(@RequestBody UserRecordUpdateRequest request){
        return new ResponseEntity<Boolean>(singleGameService.setUserRecord(request), HttpStatus.OK);
    }

    @PostMapping("/entrance")
    public void countSingleModeEntrance() {
    	singleGameService.countSingleModeEntrance();
    }
}
