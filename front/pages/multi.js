import style from '../styles/multi.module.css';
import Link from 'next/link';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import {AnimatePresence} from 'framer-motion';
import { useState } from 'react';
import Backdrop from '../components/multi/backdrop';


export default function Multi() {
  // const basicURL = 'https://k6a401.p.ssafy.io/api'
  const [modal, setModal] = useState(false);

  const openFindModal = () => {
    setModal(1);
  }
  const openJoinModal = () => {
    setModal(2);
  }
  const openCreateModal = () => {
    setModal(3);
  }
  const closeModal = () => {
    setModal(false);
  }

  // const joinRoom = () => {
  //   axios.get(`${basicURL}/chat/rooms`)
  //     .then(res=>res.data)
  //     .then(data=>{
  //       if(data.length === 0) {
  //         alert("대기 중인 방이 없습니다. 잠시후 시도해 주세요.");
  //       } else {
  //         location.href=`multi/${data[data.length-1].roomId}`;
  //       }
  //     })
  //     .catch(e=>console.error(e))
  // }

  return (
    <Parallax 
      pages={1}
      style={{
        overflow: "hidden",
      }}
    >
      <ParallaxLayer
        offset={0}
        style={{
          backgroundImage: 'url("/images/stars.svg")',
          backgroundColor: '#565656',
          backgroundSize: 'cover',
          display: 'flex',
          justifyContent: 'center',
          zIndex: '0',
        }}
      />

      <ParallaxLayer
        offset={0}
        factor={4}
        style={{
          backgroundImage: 'url("/images/intro.svg")',
          backgroundSize: 'cover',
          position: 'absolute',
          left: '50%',
          top: '100%',
          opacity: '0.2',
          transform: 'translate(-50%, -50%)',
          zIndex: '0',
        }}
      />

      <ParallaxLayer offset={0} style={{zIndex: 6}} >
        <main className={style.multi}>
          <nav className={style.lobby}>
            <div className={style.findBtn} onClick={openFindModal}>
              <div>
                <div className={style.findImg}>
                  <div className={style.blingSS} />
                  <div className={style.blingS} />
                  <div className={style.blingM} />
                </div>
              </div>
              <h2>find</h2>
            </div>
            <div className={style.joinBtn} onClick={openJoinModal}>
              <div>
                <div className={style.joinImg1} />
                <div className={style.joinImg2} />
                <div className={style.spark} />
              </div>
              <h2>join</h2>
            </div>
            <div className={style.createBtn} onClick={openCreateModal}>
              <div>
                <div className={style.createImg1} />
                <div className={style.createImg2} />
              </div>
              <h2>create</h2>
            </div>
          </nav>
          <Link href={'/'} passHref>
            <button className={style.back} >back</button>
          </Link>
        </main>
        
        <AnimatePresence    // 모달창들
          // initial animation (바로 사라져버리는것?) 비활성화시킴
          initial={false}
          // animation이 다 끝나야만 화면에서 컴포넌트가 사라지게함
          exitBeforeEnter={true}
          >
          {modal === 1 && <Backdrop label="findModal" handleClose={closeModal} />}
          {modal === 2 && <Backdrop label="joinModal" handleClose={closeModal} />}
          {modal === 3 && <Backdrop label="createModal" handleClose={closeModal} />}
        </AnimatePresence>

      </ParallaxLayer>
    </Parallax>
  )
}