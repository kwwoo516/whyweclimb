import style from './modeSelect.module.css';
import Link from 'next/link';
import Modal from "../ui/modal/modal";
import React, { useState } from 'react';
import axios from'axios';
import { AnimatePresence } from 'framer-motion';
import Backdrop from '../multi/backdrop';


export default function ModeSelect({toMain, toConfigure}) {
  
  // const test = (e) => {
  //   e.preventDefault();

  //   const token = sessionStorage.getItem("token");
  //   console.log(token);
  //   const headers = {
  //     'Authorization': token,
  //     mode: 'no-cors'
  //   }
  //   fetch('https://k6a401.p.ssafy.io/api/user/information', {headers: headers})
  //   .then((response) => {
  //     console.log(response.json());
  //   });
  // };
  const [modal, setModal] = useState(false);

  const openSelectModal = () => {
    setModal(4);
  }
  const closeModal = () => {
    setModal(false);
  }
  // const characters = () => {
  //   const result = [];
  //   for (let i = 1; i<=4;i++){
      
  //     result.push(<a onClick={saveCharacter(i)}><img className={style.characters} src = {`/images/${i}/running_R1.png`} /></a>)
  //   }
  //   return result
  // }
  return (
    <main className={style.container}>

      <a onClick={openSelectModal} className={style.selectBtn}>
        <h4>Character Select</h4>
      </a>

      <section className={style.container2}>
        <a className={style.btn} href={'/single/singleGame'}>
          <div className={style.stage}>
            <img className={`${style.box} ${style.bounce7}`} src="/images/running_R1.png" alt="a character jumping image" />
          </div>
          <h2>Single Mode</h2>
        </a>
        <a className={style.btn1} href={'/multi'}>
          <div className={style.stage1}>
            {/* https://css-tricks.com/making-css-animations-feel-natural/ 참고 */}
            <img className={`${style.box1} ${style.bounce1}`} src="/images/sourceror.png" alt="a character jumping image" />
            <img className={`${style.box1} ${style.bounce2}`} src="/images/dwarf.png" alt="a character jumping image" />
            <img className={`${style.box1} ${style.bounce3}`} src="/images/woodElf.png" alt="a character jumping image" />
          </div>
          <h2 className={style.glow}>Multi Mode</h2>
        </a>
      </section>
      {/* <button onClick={toConfigure}>configure</button> */}
      <button className={style.btnBack} onClick={toMain}>logout</button>

      <AnimatePresence    // 모달창들
        // initial animation (바로 사라져버리는것?) 비활성화시킴
        initial={false}
        // animation이 다 끝나야만 화면에서 컴포넌트가 사라지게함
        exitBeforeEnter={true}
        >
        {modal === 4 && <Backdrop label="selectModal" handleClose={closeModal} />}
      </AnimatePresence>
    </main>
  )
}