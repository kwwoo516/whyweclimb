package com.whyweclimb.backend.intercepter;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

import com.whyweclimb.backend.domain.room.service.MessageService;
import com.whyweclimb.backend.domain.room.service.RoomService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
 
@Log4j2
@RequiredArgsConstructor
public class UserInterceptor implements ChannelInterceptor {

	private final MessageService messageService;
	private final RoomService roomService;
	
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor
                = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

//        if(StompCommand.SUBSCRIBE.equals(accessor.getCommand())){
//        	String[] tokens = accessor.getDestination().split("/");
//        	String roomCode = tokens[tokens.length-1]; //Parsed RoomID
//        	
//        	if (messageService.roomStatus(roomCode)) {
//        		messageService.increaseNumberOfPeople(Room.builder()
//        				.roomCode(roomCode)
//        				.sessionId(accessor.getSessionId())
//        				.build());
//        	}else {
//        		return null;
//        	}
//        	
////            StompHeaderAccessor headerAccessor = StompHeaderAccessor.create(StompCommand.MESSAGE);
////            headerAccessor.setSessionId(accessor.getSessionId());
////            headerAccessor.setSubscriptionId(accessor.getSubscriptionId());
////            if (true) {
////                headerAccessor.setMessage("FULL");
////                customChannel.send(MessageBuilder.createMessage(new byte[0], headerAccessor.getMessageHeaders()));
////                return null;
////            }else{
////                headerAccessor.setMessage("OK");
////            }
////            customChannel.send(MessageBuilder.createMessage(new byte[0], headerAccessor.getMessageHeaders()));
//        }else 
        if(StompCommand.DISCONNECT.equals(accessor.getCommand())) {
        	String roomCode = "";
        	try {
        		roomCode = messageService.getAccess(accessor.getSessionId()).getRoomCode();
        		messageService.decreaseNumberOfPeople(accessor.getSessionId());
        		
        		if (messageService.playerList(roomCode).size() == 0) {
        			roomService.deleteRoom(roomCode);
        		}
			} catch (NullPointerException e) {
				log.warn("access already out processed");
			}
        }
        return message;
    }
}