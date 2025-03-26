import { PrimaryButton, SecondaryButton, TertiaryButton } from '../../ui/Button.jsx';
import { UserPlus } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react'
import '../styles/header.css'

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className='row'>
        <img src='logo.svg' height={42}></img>

        <div className='row'>
          <SecondaryButton onClick={() => navigate("/login")}>Login</SecondaryButton>
          <PrimaryButton onClick={() => navigate("/register")}>
            <UserPlus/>
            Create account
          </PrimaryButton>
        </div>
    </header>
  )
}
