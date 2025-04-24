import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { UserPlus, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './styles/header.css'
import './styles/home.css'
import './styles/_responsive.css'

export default function Home() {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);
  
  useEffect(() => {
    const savedUuid = localStorage.getItem('uuid');
    if (!savedUuid) return;

    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };

    fetch(import.meta.env.VITE_API_URL + "/autologinCheck/" + savedUuid, requestOptions)
      .then(response => response.json())
      .then(response => {
        if (response.status === false) {
          localStorage.setItem('uuid', "");
          sessionStorage.setItem("session-accepted", 0);
          setIsLogged(false);
          console.warn(`Autologin to: '${savedUuid}' rejected by API with reason: '${response.err_msg}'`);
        } else {
          localStorage.setItem("fullname", response.data.fullname);
          localStorage.setItem("email", response.data.email);
          sessionStorage.setItem('session-accepted', 1);
          setIsLogged(true);
          console.log(`Autologin successful to: '${savedUuid}'`);
        }
      })
      .catch(err => {
        localStorage.setItem('uuid', "");
        sessionStorage.setItem("session-accepted", 0);
        setIsLogged(false);
        console.warn("Failed to request autologin");
      });
    }, []);

  return (
    <>
      <header className='row homeHeader'>
        <img src='logo.svg' height={42}></img>
        <div className='row'>
          {
            (isLogged) ? (
              <>
                <PrimaryButton onClick={() => navigate('/dash')}>
                  <LayoutDashboard/>
                  Dashboard
                </PrimaryButton>
              </>
            ) : (
              <>
                <SecondaryButton onClick={() => navigate("/login")}>Login</SecondaryButton>
                <PrimaryButton onClick={() => navigate("/register")}>
                  <UserPlus/>
                  Create account
                </PrimaryButton>
              </>
            )
          }
        </div>
      </header>
      <div className='squaresBgContainer'>
        <Squares 
          speed={0.25} 
          squareSize={40}
          direction='diagonal'
          borderColor='#f2eedd'
          hoverFillColor='#f2eedd'
        />
      </div>
    </>
  )
}

