import { useState } from 'react'
import './styles/home.css'
import Header from './components/Header.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input } from '../ui/Input.jsx';
import Squares from '../blocks/Backgrounds/Squares.jsx';

export default function Home() {

  return (
    <>
      <Header/>
      <div className='squaresBgContainer'>
        <Squares 
          speed={0.25} 
          squareSize={40}
          direction='diagonal' // up, down, left, right, diagonal
          borderColor='#f2eedd'
          hoverFillColor='#f2eedd'
        />
      </div>
    </>
  )
}

