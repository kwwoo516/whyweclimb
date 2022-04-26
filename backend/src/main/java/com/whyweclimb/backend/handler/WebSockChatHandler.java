package com.whyweclimb.backend.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.whyweclimb.backend.domain.room.service.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j
@RequiredArgsConstructor
@Component
public class WebSockChatHandler extends TextWebSocketHandler {
    private final ObjectMapper objectMapper;
    private final ChatService chatService;

//    @Override
//    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception{
//        String payload = message.getPayload();
//        log.info("payload {}",payload);
////        TextMessage textMessage = new TextMessage("Welcome chatting server");
////        session.sendMessage(textMessage);
//        ChatMessage chatMessage = objectMapper.readValue(payload, ChatMessage.class);
//        ChatRoom room.ftl = chatService.findRoomById(chatMessage.getRoomId());
//        room.ftl.handleActions(session, chatMessage, chatService);
//    }
}
