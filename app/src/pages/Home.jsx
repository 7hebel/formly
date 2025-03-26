import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { UserPlus, LayoutDashboard } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import './styles/header.css'
import './styles/home.css'


export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <header className='row'>
        <img src='logo.svg' height={42}></img>
        <div className='row'>
          {
            (sessionStorage.getItem("session-accepted") == "1") ? (
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

