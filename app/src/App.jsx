import { useState } from 'react'
import './App.css'
import BlurText from './blocks/TextAnimations/BlurText/BlurText';

function App() {

  return (
    <>
        <BlurText
          text="Isn't this so cool?!"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-2xl mb-8"
        />
    </>
  )
}

export default App
