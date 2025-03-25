import { PrimaryButton, SecondaryButton, TertiaryButton } from '../../ui/Button.jsx';
import { MultiplePages, User } from 'iconoir-react'
import { useState } from 'react'
import '../styles/header.css'

export default function Header() {
  return (
    <header className='row'>
        <div className='row'>
          <MultiplePages strokeWidth={2}/>
          <h1 className='header-text'>Formly</h1>
        </div>

        <div className='row'>
          <SecondaryButton>Login</SecondaryButton>
          <PrimaryButton>
            <User/>
            Create account
          </PrimaryButton>
        </div>
    </header>
  )
}
