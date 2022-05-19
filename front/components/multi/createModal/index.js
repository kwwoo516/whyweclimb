import style from './createModal.module.css';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function CreateModal({handleClose}) {
  const basicURL = 'https://k6a401.p.ssafy.io/api'
  const [roomCode, setroomCode] = useState("");
  const [roomInterference, setroomInterference] = useState(false);
  const [roomPrivate, setroomPrivate] = useState("");
  const [roomMaxNum, setroomMaxNum] = useState("");
  const [roomInfo, setRoomInfo] = useState({roomCode:"", roomInterference:false, roomPrivate:"", roomMaxNum:""});
  
  const nameChange = (e) => {
    setroomCode(e.target.value);
  }

  const roomInterferenceSelect = (e) => {
    setroomInterference(e.target.value);
  };
  const privacySelect = (e) => {
    setroomPrivate(e.target.value);
  };
  const roomMaxNumSelect = (e) => {
    setroomMaxNum(e.target.value);
  };
  const handleChange = (e) => {
    const {name, value} = e.target
   
    if (name === "roomMaxNum") {
      setRoomInfo(prev => ({
        ...prev,
        [name]: parseInt(value)
      }))
    } else if (name === "roomCode") {
      setRoomInfo(prev => ({
        ...prev,
        [name]: value
      }))
    } else {
      setRoomInfo(prev => ({
        ...prev,
        [name]: value === "true" ? true: false
      }))
    }
  }

  const closeModal = () => {
    toast.dismiss();
  }

  function createRoom(){
    const token = sessionStorage.getItem("token");
    const headers = {
      'Authorization': token,
      mode: 'no-cors'
    };
    axios.post(`${basicURL}/room`, roomInfo, {headers:headers})
      .then(response => response.data)
      .then(data=>location.href=`multi/${data.roomCode}`)
      .catch(err=>console.error(err));
  }

  const popUp = {
    initial: {
      y: "-30vh",
      opacity: 0,
    },
    visible: {
      y: "0",
      opacity: 1,
      transition: {
        duration: 0.1,
        type: "spring",
        damping: 25,
        stiffness: 500,
      }
    },
    exit: {
      y: "-30vh",
      opacity: 0,
      transition: {
        duration: 0.2,
      }
    }
  }

  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      variants={popUp}
      initial="initial"
      animate="visible"
      exit="exit"
    >
      <main className={style.container}>
        <h1 className={style.fonts}>Create room</h1>
        <div className={style.container2}>          
          <section className={style.choice}>
            <span className={style.smallfonts}>Private Room</span>
            <div className={style.buttons}>
              <label className={style.button}>
                <input onClick={handleChange} type="radio" name="roomPrivate" value="true" required />
                Yes
              </label>
              <label className={style.button}>
                <input onClick={handleChange} type="radio" name="roomPrivate" value="false" required />
                No
              </label>
            </div>
          </section>
          <section className={style.choice}>
            <span className={style.smallfonts}>Max player number</span>
            <div className={style.buttons}>
              <label className={style.button}>
                <input onClick={handleChange} type="radio" name="roomMaxNum" value="2" required />
                2
              </label>
              <label className={style.button}>
                <input onClick={handleChange} type="radio" name="roomMaxNum" value="3" required />
                3
              </label>
              <label className={style.button}>
                <input onClick={handleChange} type="radio" name="roomMaxNum" value="4" required />
                4
              </label>
            </div>
          </section>
        </div>
        <div className={style.links}>
          <button className={style.okBtn} onClick={createRoom}>create</button>
          <button className={style.backBtn} onClick={handleClose}>close</button>
        </div>
      </main>
    </motion.div>
  )
}