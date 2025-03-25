import { useState } from 'react'
import './styles/header.css'
import { MultiplePages } from 'iconoir-react'

export default function Header() {

  return (
    <header>
        <MultiplePages strokeWidth={2}/>
        <h1 className='header-text'>Formly</h1>
    </header>
  )
}
