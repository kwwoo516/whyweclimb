import { useEffect, useState } from "react";
import { useRouter } from "next/router"
import style from './multiGame.module.css';
import axios from 'axios'
import Link from 'next/link';
import SockJS from 'sockjs-client';
import dynamic from "next/dynamic";
import { Suspense } from "react";
import WaitingRoom from "../../components/multi/waitingRoom";
import toast from "react-hot-toast";


const StompJS = require('@stomp/stompjs');
const Engine = dynamic(() => { return import('../../components/new_multi')}, {ssr:false});

const basicURL = 'https://k6a401.p.ssafy.io/api';
// const basicURL = `http://localhost:8081/api`
const Stomp = StompJS.Stomp;
const stomp = Stomp.over(function(){
  return new SockJS(`${basicURL}/ws-stomp`);
})
stomp.reconnect_delay = 5000;

export default function WaitRoom() {
  const [isStart, setIsStart] = useState(false);
  const router = useRouter();
  const {roomID} = router.query;
  const [userInfo, setUserInfo] = useState();
  const [roomInfo, setRoomInfo] = useState();
  const [groupInfo, setGroupInfo] = useState();
  const [isReady, setIsReady] = useState();
  const [sessionId, setSessionId] = useState();

  // function sendMessage(msg){
  //   // console.log('hii');
  //   stomp.send(`/pub/chat/message`, {}, JSON.stringify({type:'MOVE', roomId:roomID, sender:'noman1', message:msg}));
  // }

  function startGame(){
    var count = 0;
    for (const player of groupInfo){
      if (player.ready === true) count++;
    }
    if (count === groupInfo.length){
      const token = sessionStorage.getItem("token");
      const headers = {
        'Authorization': token,
        mode: 'no-cors'
      };
      axios.put(`${basicURL}/room/start/${roomID}`,{headers:headers})
      .then(res=> console.log('start!!!',res))
      .catch(err=>console.error(err))
    }
  }

  function receiveMessage(msg){
    // console.log('msg',msg)
    if(msg.data){
      setGroupInfo(msg.data);
    }    
    if(msg.message && msg.message==="start"){
      setIsStart(prev => !prev);
    }
  }

  function ready(){
    stomp.send(`/pub/room/ready`,{},userInfo.userSeq);
  }

  function userConfirm(data){
    const token = sessionStorage.getItem("token");
    const headers = {
      'Authorization': token,
      mode: 'no-cors'
    }
    axios.get(`${basicURL}/user/${data.userSeq}`,{headers:headers})
      .then(res=> console.log('confirmed!!',res))
      .catch(err=>{
        toast.error("your account is currently in use.");
        window.sessionStorage.clear();
        location.href="/";
      })
  }


  function socketConnect(data){
    stomp.connect({},
      function(){
        // console.log('stomp',stomp.webSocket._transport.url);
        const strings = stomp.webSocket._transport.url.split('/');
        const sessionId = strings[strings.length-2];
        setSessionId(sessionId)
        stomp.subscribe(`/sub/room/`+roomID, function(message){
            // console.log('here !!!message',message);
            var recv = JSON.parse(message.body);
            receiveMessage(recv);
        });
        // console.log(data.skinSeq,"skinSeq")
        stomp.send(`/pub/room/entrance`,{},JSON.stringify({roomCode:roomID, sessionId:sessionId, userSeq:data.userSeq, userId:data.userId, skinSeq:data.skinSeq}));
      },
      function(error){
        // console.log('error',error.headers.message);
      }
    )
  }

  function getUserInfo(){
    const token = sessionStorage.getItem("token");
    const headers = {
      'Authorization': token,
      mode: 'no-cors'
    }
    fetch(`https://k6a401.p.ssafy.io/api/user/information`, {headers:headers})
      .then(res => res.json())
      .then(data => {socketConnect(data);userConfirm(data);setUserInfo(data)})
      .catch(err => {
        toast.error("Please login again.");
        sessionStorage.removeItem("token");
        location.href="/";        
      })
  }

  function goBack(){
    axios.post(`${basicURL}/exit/${sessionId}`)
    stomp.disconnect(function(){
      toast("You left the room.", {icon: "🚪"});
      location.href="/multi";
    })
    
  }
  
  useEffect(()=>{
    if(roomID){
      const token = sessionStorage.getItem("token");
      const headers = {
        'Authorization': token,
        mode: 'no-cors'
      }
      axios.get(`${basicURL}/room/${roomID}`,{headers:headers})
        .then(res=>res.data)
        .then(data=>{
          if(data!==''){
            // console.log(data);
            setRoomInfo(data);
            getUserInfo();
          } else {
            toast("The room doesn't exist!", {icon: "✨"});
            location.href="/multi";
          }
        })
        .catch(err => console.error(err))
      
    }
    return () => {
      console.log(sessionId)
      axios.post(`${basicURL}}/exit/${sessionId}`)
      stomp.disconnect(function(){
        location.href="/multi";
      })
      
    }
  },roomID)

  return (
    <>
      {!isStart &&
        <WaitingRoom
          roomID={roomID} 
          groupInfo={groupInfo} 
          roomInfo={roomInfo}
          ready={ready}
          startGame={startGame}
          goBack={goBack}
        /> 
      }      
      {isStart && <main className={style.container}>
        <div className={style.head}>
          <p className={style.title}>Why We Climb</p>
          
            <p id="mute">Mute<input type="checkbox" /></p>
            <p className={style.time} id="time"></p>
          
        </div>
        <Engine stomp={stomp} roomId={roomID} userInfo={userInfo} groupInfo={groupInfo} roomSeq={roomInfo.roomSeq}/>
        <div className={style.buttons}>
          <Link href={'/'} passHref>
            <a><h3 className={style.resultText}>Back</h3></a>
          </Link>
        </div>
      </main>}
    </>
    
  )
}
