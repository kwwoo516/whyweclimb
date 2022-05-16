import { useState } from 'react';
import style from './joinModal.module.css';
import axios from 'axios'
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function JoinModal({handleClose}) {
  const basicURL = 'https://k6a401.p.ssafy.io/api'
  const [isInterference, setIsInterference] = useState("");

  const handleChange = (e) => {
    setIsInterference(e.target.value);
  }

  const joinRoom = () => {
    axios.get(`${basicURL}/room?roomInterference=${isInterference}`)
      .then(res=>res.data)
      .then(data=>{
        if(data.length === 0) {
          alert("대기 중인 방이 없습니다. 잠시후 시도해 주세요.");
        } else {
          location.href=`multi/${data.roomCode}`;
        }
      })
      .catch(e=>console.error(e))
  }

  const closeModal = () => {
    toast.dismiss();
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
      <section className={style.modal}>
        <h2>join room</h2>
        <div className={style.card}>
          <span>set interference</span>
          <div>
            <label>
              <input onClick={handleChange} type="radio" name="roomInterference" value="true" required />
              on
            </label>
            <label>
              <input onClick={handleChange} type="radio" name="roomInterference" value="false" required />
              off
            </label>
          </div>

        </div>
        <div className={style.btns}>
          <button className={style.okBtn} onClick={joinRoom} >join</button>
          <button className={style.backBtn} onClick={handleClose} >close</button>
        </div>
      </section>
    </motion.div>
  )
}