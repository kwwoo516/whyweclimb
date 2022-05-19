import style from '../styles/test.module.css';

export default function Test() {

  return (
    <>
      <main className={style.container}>
        <h2>wow!</h2>
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
        <section className={style.players}>
          <img className={style.player1} src="/images/dwarf.png" alt="character image" />
          <img className={style.player2} src="/images/running_R2.png" alt="character image" />
          <img className={style.player3} src="/images/sourceror.png" alt="character image" />
          <img id={style.player4} className={style.player4} src="/images/woodelf.png" alt="character image" />
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

};