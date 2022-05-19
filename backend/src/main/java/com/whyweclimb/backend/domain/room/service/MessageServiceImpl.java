package com.whyweclimb.backend.domain.room.service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.whyweclimb.backend.domain.room.repo.AccessRedisRepository;
import com.whyweclimb.backend.domain.room.repo.CumulativeConnectionRepository;
import com.whyweclimb.backend.domain.room.repo.RoomRepository;
import com.whyweclimb.backend.domain.room.repo.SimultaneousConnectionRepository;
import com.whyweclimb.backend.entity.Access;
import com.whyweclimb.backend.entity.CumulativeConnection;
import com.whyweclimb.backend.entity.SimultaneousConnection;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService{
	private final AccessRedisRepository accessRedisRepository;
	private final RoomRepository roomRepository;
	private final SimultaneousConnectionRepository simultaneousConnectionRepository;
	private final CumulativeConnectionRepository cumulativeConnectionRepository;

	@Override
	@Transactional
	public void increaseNumberOfPeople(Access access) {
		CountUpConnection(LocalDate.now());
		
		accessRedisRepository.save(pretreatment(access));
	}

	public Access pretreatment(Access access) {
		int max = 0;
		for (Access a : accessRedisRepository.findByRoomCode(access.getRoomCode())) {
			max = Math.max(max, a.getOrder());
		}
		access.setOrder(max+1);
		access.setReady(false);
		return access;
	}
	
	public void CountUpConnection(LocalDate today) {
		Optional<CumulativeConnection> cumul = cumulativeConnectionRepository.findByConnectionDate(today);
		if (cumul.isPresent()) {
			cumulativeConnectionRepository.save(CumulativeConnection.builder()
					.cumulativeConnectionSeq(cumul.get().getCumulativeConnectionSeq())
					.connectionCount(cumul.get().getConnectionCount()+1)
					.connectionDate(cumul.get().getConnectionDate())
					.build());
		}else {
			cumulativeConnectionRepository.save(CumulativeConnection.builder()
					.connectionCount(1)
					.connectionDate(today)
					.build());
		}

		Iterable<Access> counts = accessRedisRepository.findAll();
		int count = 0;
		for (Access access : counts) count++;
		
		Optional<SimultaneousConnection> simul = simultaneousConnectionRepository.findByConnectionDate(today);
		if (simul.isPresent()) {
			if(simul.get().getConnectionCount() < count) {
				simultaneousConnectionRepository.save(SimultaneousConnection.builder()
						.simultaneousConnectionSeq(simul.get().getSimultaneousConnectionSeq())
						.connectionCount(count)
						.connectionDate(simul.get().getConnectionDate())
						.build());
			}
		}else {
			simultaneousConnectionRepository.save(SimultaneousConnection.builder()
					.connectionCount(1)
					.connectionDate(today)
					.build());
		}
	}
	

	@Override
	public void decreaseNumberOfPeople(String sessionId) {
		accessRedisRepository.deleteById(sessionId);
	}

	@Override
	public boolean roomStatus(String roomCode) {
		boolean result = false;

		int now = accessRedisRepository.findByRoomCode(roomCode).size();
		int max = roomRepository.findByRoomCode(roomCode).orElse(null).getRoomMaxNum();
		
		if (now < max) result = true;

		return result;
	}

	@Override
	public List<Access> playerList(String roomCode) {
		List<Access> list = accessRedisRepository.findByRoomCode(roomCode);
		Collections.sort(list);
		return list;
	}

	@Override
	public String getReady(Integer userSeq){
		Access access = accessRedisRepository.findByUserSeq(userSeq);
		access.setReady(true);
		accessRedisRepository.save(access);
		
		return access.getRoomCode();
	}

	@Override
	public Access getAccess(String sessionId) {
		return accessRedisRepository.findBySessionId(sessionId);
	}
}
