import { useState } from 'react'
import './styles/home.css'
import Header from './components/Header.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import Squares from '../blocks/Backgrounds/Squares.jsx';
import { SingleSelect, MultiSelect } from '../ui/Select.jsx';

export default function Home() {

  return (
    <>
      <Header/>
      <div className='squaresBgContainer'>
        <Squares 
          speed={0.25} 
          squareSize={40}
          direction='diagonal'
          borderColor='#f2eedd'
          hoverFillColor='#f2eedd'
        />
      </div>
      <div className='pres'>
        <InputGroup>
          <InputLabel>Very long question? sp[efls p[el[sle[pf l[]]]]]</InputLabel>
          <SingleSelect qid='tset' options={['option 1', 'option 2', 'option 3']}></SingleSelect>
        </InputGroup>

        <InputGroup>
          <InputLabel>Very long question? sp[efls p[el[sle[pf l[]]]]]</InputLabel>
          <MultiSelect qid='tset' options={['option 1', 'option 2', 'option 3']}></MultiSelect>
        </InputGroup>
      </div>
    </>
  )
}

