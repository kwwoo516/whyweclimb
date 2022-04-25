import Lobby from '../components/multi/lobby';
import FindModal from '../components/findModal';
import style from '../styles/multi.module.css';
import Link from 'next/link';
import { useState } from 'react';

export default function Multi() {
  
  const [multiRoom, setMultiRoom] = useState(0);  // 0:lobby  1:waiting  2:create
  const [findModal, setFindModal] = useState(false);

  const toLobby = () => {
    setMultiRoom(0);
  };
  const toWaiting = () => {
    setMultiRoom(1);
  };
  const toCreate = () => {
    setMultiRoom(2);
  };
  const toggleFindModal = () => {
    setFindModal(!findModal);
  }

  return (
    <main className={findModal ? style.modalOn : style.multi}>
      {multiRoom == 0 && <Lobby toWaiting={toWaiting} toCreate={toCreate} toggleFindModal={toggleFindModal} />}

      {findModal && <FindModal toggleFindModal={toggleFindModal} />}

      <Link href={'/'} passHref>
        <button>back</button>
      </Link>        
    </main>
  )
}