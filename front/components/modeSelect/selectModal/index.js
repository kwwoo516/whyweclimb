import style from './selectModal.module.css';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';


export default function CreateModal({handleClose}) {  

  const saveCharacter = (num) => {
    // console.log("clickCharacter")
    axios({
      url:'https://k6a401.p.ssafy.io/api/user/information',
      method:'GET',
      headers: {
        "Authorization":sessionStorage.getItem("token")
      }
    }).then(res=>{
      axios({
        url:`https://k6a401.p.ssafy.io/api/user`,
        method:'PUT',
        headers: {
          "Authorization": sessionStorage.getItem("token")
        },
        data:{
          "userSeq": res.data.userSeq ,
          "skinSeq": num ,
        }
        
      }).then(res=>{
        // console.log(res)
        toast.success("Character saved!");
        handleClose();
        
      }).catch(err=>console.error(err))
    }).catch(err=>console.error(err))
    
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
      <h2>Character Select</h2>
        <div className={style.inModal}>
          <div className={style.modalHalf}>
            <a className={style.imageA}onClick={(e)=>{saveCharacter(1, e)}}><img className={style.characters} src = {`/images/${1}/running_R1.png`} /></a>
            
            <a className={style.imageA}onClick={(e)=>{saveCharacter(2, e)}}><img className={style.characters} src = {`/images/${2}/running_R1.png`} /></a>
            
          </div>
          <div className={style.modalHalf}>
            <a className={style.imageA}onClick={(e)=>{saveCharacter(3, e)}}><img className={style.characters} src = {`/images/${3}/running_R1.png`} /></a>
            
            <a className={style.imageA}onClick={(e)=>{saveCharacter(4, e)}}><img className={style.characters} src = {`/images/${4}/running_R1.png`} /></a>
            
          </div>
        </div>
        <button className={style.backBtn} onClick={handleClose}>back</button>
      </main>
    </motion.div>
  )
}