import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { SingleSelect, MultiSelect } from '../ui/Select.jsx';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import './styles/dashboard.css'
import { useEffect } from 'react';


export default function Dashboard() {
  const navigate = useNavigate();
  const fullname = localStorage.getItem("fullname") ?? "user"
  
  if (sessionStorage.getItem("session-accepted") == "0") {
    console.warn("Cannot enter dashboard without accepted session.");
    useEffect(() => {navigate("/")}, [])
  }
  
  function onLogout() {
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    
    fetch(import.meta.env.VITE_API_URL + "/logout/" + localStorage.getItem("uuid"), requestOptions)
    .then(response => response.json())
    .then(response => {
      sessionStorage.clear();
      localStorage.clear();
      navigate("/");
    })
    .catch(err => {
      sessionStorage.clear();
      localStorage.clear();
      navigate("/");
    });
  }

  return (
    <>
      <div className='squaresBgContainer'>
        <Squares 
          speed={0.25} 
          squareSize={40}
          direction='diagonal'
          borderColor='#f2eedd'
          hoverFillColor='#f2eedd'
        />
      </div>
      
      <header className='dash-header'>
        <img src='logo.svg' height={42} onClick={() => {navigate('/')}}></img>
        <h1 className='welcome-msg'>
            Welcome, <span id='welcome-msg-name'>{fullname}</span>
        </h1>
        <TertiaryButton onClick={onLogout}>
          <LogOut/>
          Logout
        </TertiaryButton>
      </header>
    </>
  )
}

