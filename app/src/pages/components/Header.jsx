import { PrimaryButton, SecondaryButton, TertiaryButton } from '../../ui/Button.jsx';
import { UserPlus, ClipboardList } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react'
import '../styles/header.css'

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className='row'>
        <div className='row'>
          <ClipboardList/>
          <h1 className='header-text'>Formly</h1>
        </div>

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
