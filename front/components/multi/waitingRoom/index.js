import style from './waitingRoom.module.css';


export default function WaitingRoom({roomID, groupInfo, roomInfo, ready, startGame, goBack}) {

  return (
    <>
      <main className={style.container}>
        <section className={style.headerContainer}>
          <header>welcome to room: {roomID}</header>
          <section className={style.status}>
            {groupInfo && groupInfo.length} / {roomInfo && roomInfo.roomMaxNum}
          </section>
        </section>

        <section>
          {groupInfo && groupInfo.slice(0).reverse().map((player, index) => 
            <div key={player.userSeq}>
              {console.log(player)}
              <img 
                className={`player${index+1}`} 
                src={`/images/waitRoomImg/${player.skinSeq}.png`} 
                alt="character image" 
              />
              <div className={`playerInfo${index+1}`}>
                {player.userId} - {player.ready? "ready!" : "not ready"}
              </div>
            </div>
          )}
        </section>

        <section className={style.btns}>
          <button className={style.readyBtn} onClick={ready}>ready</button>
          <button className={style.startBtn} onClick={startGame}>start</button>
          <button className={style.backBtn} onClick={goBack}>back</button>
        </section>
        
        <section>
          <img className={style.closestCloud1} src="/images/cloud.svg" alt="cloud image" />
          <img className={style.closestCloud2} src="/images/cloud.svg" alt="cloud image" />
          <img className={style.closestCloud3} src="/images/cloud.svg" alt="cloud image" />
          <img className={style.closestCloud4} src="/images/cloud.svg" alt="cloud image" />
          <img className={style.closestCloud5} src="/images/cloud.svg" alt="cloud image" />
          
          <img className={style.closeCloud1} src="/images/cloud.svg" alt="cloud image" />
          <img className={style.closeCloud2} src="/images/cloud.svg" alt="cloud image" />
          <img className={style.closeCloud3} src="/images/cloud.svg" alt="cloud image" />
          
          <img className={style.farCloud1} src="/images/cloud.svg" alt="cloud image" />
          <img className={style.farCloud2} src="/images/cloud.svg" alt="cloud image" />
          <img className={style.farCloud3} src="/images/cloud.svg" alt="cloud image" />
          <img className={style.farCloud4} src="/images/cloud.svg" alt="cloud image" />
        </section>

        <section>
          <div className={style.wind1} />
          <div className={style.wind2} />
          <div className={style.wind3} />
          <div className={style.wind4} />
          <div className={style.wind5} />
          <div className={style.wind6} />
          <div className={style.wind7} />
          <div className={style.wind8} />
          <div className={style.wind9} />
          <div className={style.wind10} />
        </section>

      </main>
    </>
  )
}