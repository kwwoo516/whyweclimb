import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import style from './ucc.module.css';

export default function UCC({handleClose}) {

  const checkBoxRef = useRef(false);

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
  
  const setExpiration = () => {
    removeExpiration();
    const now = new Date();
    
    const item = {
      date: now.getTime() + 7,
    }

    localStorage.setItem("uccExpiration", JSON.stringify(item));
  }

  const removeExpiration = () => {
    localStorage.removeItem("uccExpiration");
  }

  const toggleExpiration = () => {
    if (checkBoxRef.current.checked) {
      setExpiration();
    } else {
      removeExpiration();
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
        <section className={style.btns}>
          <label>
            invisible for 1 week.
            <input type="checkbox" ref={checkBoxRef} onClick={toggleExpiration} />
          </label>
          <button className={style.closeBtn} onClick={handleClose}>x</button>
        </section>
        
        
        <video className="uccVideo" controls controlsList="nofullscreen" onEnded={handleClose}>
          <source src="/videos/ucc.mp4" type="video/mp4" width={200} height={100} />
        </video>

      </main>
    </motion.div>
  )
}