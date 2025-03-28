import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { TrueFalse } from '../ui/TrueFalse.jsx';
import { Modal } from '../ui/Modal.jsx';
import FormBrief from '../components/FormBrief.jsx'
import GroupView from '../components/GroupView.jsx'
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCheck, Settings2, ClipboardList, VenetianMask, Type, Hourglass, UserCheck, LockKeyhole, TextCursorInput, Text, Binary, ToggleRight, CircleCheck, SquareCheck } from 'lucide-react';
import { ErrorLabel } from "../ui/ErrorLabel.jsx"
import { useEffect, useRef, useState } from 'react';
import butterup from 'butteruptoasts';
import 'butteruptoasts/src/butterup.css';
import './styles/builder.css'


function displayMessage(content) {
  butterup.toast({
    message: content,
    location: 'bottom-center',
    dismissable: true,
  });
}


export default function FormBuilder() {
  const navigate = useNavigate();

  const [formName, setFormName] = useState("Form");

  function updateName(event) {
    if (!event.target.value || !event.target.validity.valid) return;
    setFormName(event.target.value);
  }

  return (
    <main className='builder'>
      <div className='squaresBgContainer'>
      <Squares 
        speed={0.25} 
        squareSize={40}
        direction='diagonal'
        borderColor='#f2eedd'
        hoverFillColor='#f2eedd'
      />
      </div>
      
      <header className='dash-header'>
      <img src='logo.svg' height={42} onClick={() => {navigate('/')}}></img>
      <h1 className='welcome-msg'>
        Form <span id='welcome-msg-name'>builder</span>
      </h1>
      <div className='row'>
        <PrimaryButton>
          <CheckCheck/>Save
        </PrimaryButton>
        <TertiaryButton>
            <LogOut/>Leave
        </TertiaryButton>
      </div>
      </header>

      <div className='builder-panels-container'>
        <div className='builder-properties-panel'>
          <div className='builder-panel-header'>
            <Settings2/>
            <h2>Properties</h2>
          </div>
          <div className='hzSepMid'></div>
          <div className='builder-properties-container'>
            <InputGroup>
              <InputLabel>
               <Type/>Form name
              </InputLabel>
              <Input onChange={updateName} placeholder={formName} minlen={1} maxlen={32}></Input>
            </InputGroup>
            <div className='hzSep'></div>
            <InputGroup>
              <InputLabel>
                <VenetianMask/>Anonymous answers
              </InputLabel>
              <TrueFalse qid="anon-answers"></TrueFalse>
            </InputGroup>
            <div className='hzSep'></div>
            <InputGroup>
              <InputLabel>
               <Hourglass/>Answer time limit
              </InputLabel>
              <div className='row'>
                <Input type='number' placeholder={0}></Input>
                <p className='input-unit'>Minutes.</p>
              </div>
            </InputGroup>
            <div className='hzSep'></div>
            <InputGroup>
              <InputLabel>
                <UserCheck/>Require Formly account
              </InputLabel>
              <TrueFalse qid="require-account"></TrueFalse>
            </InputGroup>
            <div className='hzSep'></div>
            <InputGroup>
              <InputLabel>
                <LockKeyhole/>Password
              </InputLabel>
              <Input type='password'></Input>
            </InputGroup>
            <div className='hzSep'></div>
          </div>
        </div>

        <div className='builder-form-panel'>
          <div className='builder-panel-header'>
            <ClipboardList/>
            <h2>{formName}</h2>
          </div>
          <div className='hzSepMid'></div>
          <div className='builder-form-content'>

            <div className='builder-new-blocks'>
              <div className='add-component-btn'>
                <TextCursorInput/>Short text answer
              </div>
              <div className='add-component-btn'>
                <Text/>Long text answer
              </div>
              <div className='add-component-btn'>
                <Binary/>Numeric answer
              </div>
              <div className='add-component-btn'>
                <ToggleRight/>True / False
              </div>
              <div className='add-component-btn'>
                <CircleCheck/>Select single option
              </div>
              <div className='add-component-btn'>
                <SquareCheck/>Select multiple options
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
    )

}
  