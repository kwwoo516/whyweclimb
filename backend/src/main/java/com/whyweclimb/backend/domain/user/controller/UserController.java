package com.whyweclimb.backend.domain.user.controller;

import com.whyweclimb.backend.domain.user.dto.UserInfoResponse;
import com.whyweclimb.backend.domain.user.dto.UserRequest;
import com.whyweclimb.backend.domain.user.dto.UserUpdateRequest;
import com.whyweclimb.backend.domain.user.service.JwtTokenProvider;
import com.whyweclimb.backend.domain.user.service.SecurityService;
import com.whyweclimb.backend.domain.user.service.UserService;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.security.NoSuchAlgorithmException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

	private final UserService userService;
	private final SecurityService securityService;
	private final JwtTokenProvider jwtTokenProvider;
	
	@ApiOperation(value = "SignUp", notes = "계정을 생성합니다.")
	@PostMapping("")
	public ResponseEntity<Boolean> createUser(@RequestBody UserRequest request) throws NoSuchAlgorithmException {
		request.setUserPassword(securityService.encrypt(request.getUserPassword()));
		UserInfoResponse response = userService.createUser(request);
		Boolean result = true;
		HttpStatus status;
		if(response == null) {
			result = false;
			status = HttpStatus.NOT_ACCEPTABLE;
		}else { 
			status = HttpStatus.CREATED;
		}
		return new ResponseEntity<Boolean>(result, status);
	}
	
	@ApiOperation(value = "CheckIdDuplicate", notes = "아이디를 중복체크 합니다.")
	@GetMapping("/id")
	public ResponseEntity<Boolean> checkId(@RequestParam String userId){
		boolean result;
		HttpStatus status;
		if (userService.checkIdDuplicate(userId)) {
			result = false;
			status = HttpStatus.CONFLICT;
		}else {
			result = true;
			status = HttpStatus.OK;
		}
		
		return new ResponseEntity<Boolean>(result, status);
	}

	@ApiOperation(value = "Login", notes = "아이디와 비밀번호를 입력받아 로그인을 진행합니다.")
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody UserRequest request) throws NoSuchAlgorithmException {
    	request.setUserPassword(securityService.encrypt(request.getUserPassword()));
    	UserInfoResponse response = userService.login(request);
		String token = "";
    	HttpStatus status;
		if(response == null) { 
			status = HttpStatus.NOT_FOUND;
		}else if (response.getUserSeq() == null){
			status = HttpStatus.CONFLICT;
		}else { 
			token = jwtTokenProvider.createToken(response.getUserId(), Collections.singletonList("ROLE_USER"));
			status = HttpStatus.OK;
		}
		log.info("생성된 jwt 토큰: "+token);
		Map<String, String> result = new HashMap<String, String>();
		result.put("token", token);
		
		return new ResponseEntity<Map<String, String>>(result, status);
    }

	@ApiOperation(value = "UserInfo", notes = "헤더에 jwt를 담아 요청 시 회원정보를 반환합니다.")
	@GetMapping("/information")
	public ResponseEntity<UserInfoResponse> postLoginProcessing(HttpServletRequest request) {
//		String user = jwtTokenProvider.getUserPk(jwtTokenProvider.resolveToken((HttpServletRequest) request));
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		return new ResponseEntity<UserInfoResponse>(userService.userInfo(authentication.getName()), HttpStatus.OK);
		
	}
    
	@ApiOperation(value = "settingUserOption", notes = "유저정보를 수정합니다.")
	@PutMapping("")
    public ResponseEntity<UserInfoResponse> modifyUser(@RequestBody UserUpdateRequest request){
    	UserInfoResponse response = userService.updateUser(request);
		HttpStatus status;
		if(response == null) { 
			status = HttpStatus.NOT_ACCEPTABLE;
		}else { 
			status = HttpStatus.OK;
		}
		return new ResponseEntity<UserInfoResponse>(response, status);
    }

	@ApiOperation(value = "checkSession", notes = "현재 멀티플레이 중인 유저인지 검사합니다.")
	@GetMapping("/{userSeq}")
	public ResponseEntity<HttpStatus> checkSession(@PathVariable int userSeq){
 		HttpStatus status;
		if(userService.checkSession(userSeq)) { 
			status = HttpStatus.OK;
		}else { 
			status = HttpStatus.CONFLICT;
		}
		return new ResponseEntity<HttpStatus>(status);
	}
	
	
}