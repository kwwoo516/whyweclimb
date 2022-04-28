import { useEffect, useState } from "react";
import { useRouter } from "next/router"
import style from '../../styles/waitRoom.module.css';
import axios from 'axios'
import Link from 'next/link';
import SockJS from 'sockjs-client';
import dynamic from "next/dynamic";

const StompJS = require('@stomp/stompjs');
const Engine = dynamic(() => { return import('../../components/multiEngine')}, {ssr:false});

const basicURL = 'http://localhost:8081/api';
const Stomp = StompJS.Stomp;
const stomp = Stomp.over(function(){
  return new SockJS(`${basicURL}/ws-stomp`);
})
stomp.reconnect_delay = 5000;



export default function WaitRoom() {
  const [isStart, setIsStart] = useState(true);
  const router = useRouter();
  const {roomID} = router.query;

  function sendMessage(msg){
    // console.log('hii');
    stomp.send(`/pub/chat/message`, {}, JSON.stringify({type:'TALK', roomId:roomID, sender:'noman1', message:msg}));
  }

  function startGame(){
    setIsStart(prev=>!prev);
  }

  function receiveMessage(msg){
    console.log(msg)
  }

  function socketConnect(){
    stomp.connect({},
      function(){
        stomp.subscribe(`/sub/chat/room/`+roomID, function(message){
          var recv = JSON.parse(message.body);
          receiveMessage(recv);
        });
        stomp.send(`/pub/chat/message`,{},JSON.stringify({type:'ENTER', roomId:roomID, sender:"noman"}));
        console.log('stomp',stomp);
      },
      function(error){
        console.log(error.headers.message);
      }
    )
  }
  
  useEffect(()=>{
    if(roomID){
      axios.get(`${basicURL}/chat/room/${roomID}`)
        .then(res=>res.data)
        .then(data=>{
          if(data!==''){
            socketConnect();
          } else {
            location.href="/multi";
          }
        })
    }
  },roomID)

  return (
    <>
      {!isStart && <main className={style.container}>
          <header>welcome to room: {roomID}</header>
          <section>
            3 / 4
          </section>
          <Link href={'/multi'}>
            <button>back to Lobby</button>
          </Link>
          <button onClick={startGame}>Start Game</button>
      </main> }
      {isStart && <main className={style.container}>
        <div>
          <p>점프컹스</p>
          <p id="mute">Mute<input type="checkbox"/></p>
        </div>
        <Engine stomp={stomp} roomId={roomID}/>
      </main>}
    </>
    
  )
}