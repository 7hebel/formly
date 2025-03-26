import { useState } from 'react'
import './styles/home.css'
import Header from './components/Header.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import Squares from '../blocks/Backgrounds/Squares.jsx';
import { SingleSelect, MultiSelect } from '../ui/Select.jsx';

export default function Dashboard() {

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
      DASHBOARD
    </>
  )
}

