import Head from 'next/head';
import Login from "../components/login"
import Signup from '../components/signup';
import ModeSelect from '../components/modeSelect';
import Backdrop from '../components/multi/backdrop';
import { useState, useEffect, useRef } from 'react';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';


export default function Home() {

  const mainRef = useRef();
  const inRef = useRef();
  const [loggedIn, setLoggedIn] = useState(false);    // false: 로그인 & 회원가입 컴포넌트, true: 모드선택 & 설정 컴포넌트
  const [uccOn, setUccOn] = useState(true);


  const toMain = () => {
    setLoggedIn(false);
    window.sessionStorage.clear();
    inRef.current.scrollTo(3);
    mainRef.current.scrollTo(0);
    setTimeout(() => {
      inRef.current.scrollTo(3);
      mainRef.current.scrollTo(0);
    }, "50");
  }
  const toSignup = () => {
    setLoggedIn(false);
    inRef.current.scrollTo(3);
    mainRef.current.scrollTo(1);
  }
  const toModeSelect = () => {
    setLoggedIn(true);
    inRef.current.scrollTo(0);
  }
  const toConfigure = () => {
    setLoggedIn(true);
  }

  const adjustLoginModal = () => {
    inRef.current.scrollTo(3);
    mainRef.current.scrollTo(0);
  }

  const closeUCC = () => {
    setUccOn(false);
    adjustLoginModal();
  }

  const openUCC = () => {
    setUccOn(true);
  }

  useEffect(() => {             // expiration date 에 따라 ucc 화면 보여줄지 결정
    // https://www.sohamkamani.com/blog/javascript-localstorage-with-ttl-expiry/ 참고
    const now = new Date();
    const expirationDate = localStorage.getItem("uccExpiration");
  
    if (expirationDate && now.getTime() > JSON.parse(expirationDate).date) {
      setUccOn(false);
    }
  }, [])

  useEffect(() => {             // 로그인 여부에 따라 메인화면 바뀜
    setLoggedIn(sessionStorage.getItem("token") ? true : false);
    if (!sessionStorage.getItem("token")) {
      setTimeout(() => {
        adjustLoginModal();
      }, "100");
    }
  }, []);

  return (
    <>
      <Head>
        <title>why we climb</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="description" content="we challenge, we compete, and we struggle to find the true reason why we climb." />
        {/* <script type="text/javascript" src="../components/main.js"></script> */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/>
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:ital,wght@1,500&family=Hahmlet:wght@300&family=Koulen&display=swap" rel="stylesheet"/>
      </Head>

      <main>
        <Parallax 
        ref={inRef} 
        pages={4}
        style={{
          overflow: "hidden",
          backgroundImage: 'url("/images/stars.svg")',
          backgroundColor: '#565656',
          backgroundSize: 'cover',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 0,
        }}
        >
          <ParallaxLayer
            offset={0}
            speed={0}
            factor={4}
          />

          <ParallaxLayer offset={0} speed={0.8} style={{ opacity: 0.2, zIndex: 0, }}>
            <img className='animate-flicker2' src='/images/cloud.svg' alt="cloud image" style={{ width: '10%', marginLeft: '55%' }} />
            <img src='/images/cloud.svg' alt="cloud image" style={{ width: '5%', marginLeft: '15%' }} />
          </ParallaxLayer>

          <ParallaxLayer offset={0} speed={0.2} style={{ opacity: 0.1, zIndex: 0, }}>
            <img src='/images/intro.svg' style={{ width: '100%'}} alt="landingpage background image" />
          </ParallaxLayer>

          <ParallaxLayer offset={0.75} speed={0.5} style={{ opacity: 0.2, zIndex: 0, }}>
            <img src='/images/cloud.svg' alt="cloud image" style={{ width: '10%', marginLeft: '70%' }} />
            <img src='/images/cloud.svg' alt="cloud image" style={{ width: '10%', marginLeft: '30%' }} />
          </ParallaxLayer>

          <ParallaxLayer offset={0} speed={0.2} style={{ opacity: 0.4, zIndex: 0, }}>
            <img src='/images/cloud.svg' alt="cloud image" style={{ width: '5%', marginLeft: '10%' }} />
            <img src='/images/cloud.svg' alt="cloud image" style={{ width: '10%', marginLeft: '75%' }} />
          </ParallaxLayer>

          {/*모드선택 컴포넌트*/}
          <ParallaxLayer
          offset={0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 6,
          }}
          >
            {loggedIn && <ModeSelect toMain={toMain} toConfigure={toConfigure} />}
          </ParallaxLayer>

          <ParallaxLayer offset={0.6} speed={-0.1} style={{ opacity: 0.8, zIndex: 0, }}>
            <img src='/images/cloud.svg' alt="cloud image" style={{ width: '10%', marginLeft: '15%' }} />
            <img className='animate-flicker1' src='/images/cloud.svg' alt="cloud image" style={{ width: '15%', marginLeft: '5%', marginBottom: '10%' }} />
            <img className='animate-flicker2' src='/images/cloud.svg' alt="cloud image" style={{ width: '5%', marginLeft: '80%' }} />
          </ParallaxLayer>

          <ParallaxLayer offset={1.6} speed={0.4} style={{ opacity: 1, zIndex: 0, }}>
            <img src='/images/cloud.svg' alt="cloud image" style={{ width: '10%', marginLeft: '5%' }} />
            <img src='/images/cloud.svg' alt="cloud image" style={{ width: '7%', marginLeft: '75%' }} />
          </ParallaxLayer>


          <ParallaxLayer offset={1}>
            <h2>image2</h2>
          </ParallaxLayer>

          <ParallaxLayer offset={2}>
            <h2>image1</h2>
          </ParallaxLayer>

          <ParallaxLayer offset={3}>        {/* 로그인 & 회원가입 컴포넌트 */}
            <Parallax 
              pages={2}
              ref={mainRef}
              horizontal
              style={{
                overflow: "hidden",
              }}
            >
              <ParallaxLayer offset={1}>
                {!loggedIn && <Signup toMain={toMain} />}
              </ParallaxLayer>
              <ParallaxLayer offset={0}>
                {uccOn && !loggedIn && <Backdrop label="uccModal" handleClose={closeUCC} />}
                {!loggedIn && <Login toSignup={toSignup} toModeSelect={toModeSelect} openUCC={openUCC} />}
              </ParallaxLayer>
            </Parallax>
          </ParallaxLayer>
  
        </Parallax>
      </main>
    </>
  )
}
