import { useState, useRef, useEffect } from 'react';
import style from './login.module.css';
import toast from 'react-hot-toast';


export default function Login({toSignup, toModeSelect, openUCC}) {

  const inputID = useRef();
  const pw = useRef();

  const [userID, setUserID] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const initializeData = () => {        // 로그인 입력 정보의 상태들 초기화
    inputID.current.value = '';
    pw.current.value = '';
    setUserID("");
    setUserPassword("");
  };

  const toSignUp = () => {
    initializeData();
    toSignup();
  }

  const handleLoginSubmit = () => {     // 로그인 버튼 누를시 post요청 (백에서 실패사유 알려주면 땡큐)
    let flag_conf = false
    fetch('https://k6a401.p.ssafy.io/api/user/login', {
      method: "POST",
      body: JSON.stringify({
        userId: userID,
        userPassword: userPassword,
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
    .then((response) => {
      // console.log(response)
      if(response.status==409){
        toast.error("현재 접속중인 ID 입니다.")
        flag_conf=true
      }
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      if (data.token) {
        sessionStorage.setItem("token", data.token);
        initializeData();
        // alert(`로그인 성공 : ${data}`)
        toModeSelect();
      }
      else {
        if(!flag_conf){
          toast.error("ID or password is not valid..");
        }
      }
    })
    .catch((error) => {
      toast.error(`failed to login due to : ${error}`);
    });
  };

  const onKeyPress=(e) => {
    if(e.key=='Enter'){
      handleLoginSubmit();
    }
  }

  useEffect(() => {
    inputID.current.focus();
  }, [])


  return (
    <main className={style.container}>
      <div className={style.title}>why we climb</div>
      
      <div className={style.loginContainer}> 
        <section className={style.login}>

          <div className={style.trailerMascot} onClick={openUCC}>
            <span />
          </div>

          <div className={style.fonts}>Login</div>
          <div className={style.card}>
            <label  className={style.smallfonts}>Id 
              <input type="text" onChange={e => setUserID(e.target.value)} ref={inputID} required />
            </label>
          </div>
          <div className={style.card}>
            <label className={style.smallfonts}>Password 
              <input type="password" onChange={e => setUserPassword(e.target.value)} ref={pw} required onKeyDown={onKeyPress}/>
            </label>
          </div>
          <div className={style.btnGroup}>
            <button className={style.loginBtn} onClick={handleLoginSubmit} >Login</button>
            <div className={style.signBtnGroup}>
              <div className={style.btns}>No account?</div>
              <button className={style.signupBtn} onClick={toSignUp} >Sign up</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}