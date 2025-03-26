import { PrimaryButton, SecondaryButton, TertiaryButton } from '../../ui/Button.jsx';
import { UserPlus, LayoutDashboard } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import '../styles/header.css'

export default function Header() {
  const navigate = useNavigate();
  
  return (
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
  )
}
