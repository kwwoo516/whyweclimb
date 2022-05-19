import style from './basicButton.module.css';


export default function BasicButton ({btnStyle, action, label}) {
  
  return (
    <button id={btnStyle} className={style.btn10} onClick={action}>
      {label}
    </button>
  )
}