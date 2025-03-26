import { useNavigate } from "react-router-dom";
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input } from '../ui/Input.jsx';
import { ErrorLabel } from "../ui/ErrorLabel.jsx"
import Squares from '../blocks/Backgrounds/Squares.jsx';
import { useEffect } from 'react';
import './styles/login.css'



export function LoginPanel() {
  const navigate = useNavigate();

  function handleLogin() {
    const emailEl = document.getElementById("login-email");
    const passwordEl = document.getElementById("login-password");
    const errorLabel = document.getElementById("login-errlabel");
    
    if (!emailEl.value || !emailEl.validity.valid) {
      errorLabel.textContent = "Invalid email";
      errorLabel.setAttribute("iserror", "1");
      return;
    }
    
    if (!passwordEl.value || !passwordEl.validity.valid) {
      errorLabel.textContent = "Invalid password";
      errorLabel.setAttribute("iserror", "1");
      return;
    }
    
    errorLabel.setAttribute("iserror", "0");
  
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailEl.value,
        password: passwordEl.value
      })
    };
      
    fetch(import.meta.env.VITE_API_URL + "/login", requestOptions)
      .then(response => response.json())
      .then(response => {
        if (response.status === false) {
          errorLabel.textContent = response.err_msg;
          errorLabel.setAttribute("iserror", "1");
          return;
        }
        
        localStorage.setItem("uuid", response.data.uuid);
        localStorage.setItem("fullname", response.data.fullname);
        sessionStorage.setItem("session-accepted", "1")
        navigate("/dash");
      })
      .catch(err => {
        errorLabel.textContent = "Failed to login.";
        errorLabel.setAttribute("iserror", "1");
        return;
      })
  }


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
      <div className="loginFormContainer">
        <div className="loginForm">
          <h1 className='panelName'>Login</h1>
          <div className='hzSep'></div>
          <div className='loginFormFields'>
            <InputGroup>
              <InputLabel>Email</InputLabel>
              <Input id='login-email' type='email' placeholder='example@email.com' minlen={3}></Input>
            </InputGroup>
            <InputGroup>
              <InputLabel>Password</InputLabel>
              <Input id='login-password' type='password' minlen={3}></Input>
            </InputGroup>
            <PrimaryButton wide onClick={handleLogin}>Login</PrimaryButton>
            <ErrorLabel id="login-errlabel"/>
          </div>
          <div className='hzSep'></div>
          <TertiaryButton wide onClick={() => {navigate('/register')}}>Create account</TertiaryButton>
        </div>
      </div>
    </>
  )
}


export function RegisterPanel() {
  const navigate = useNavigate();
  
  function handleRegister() {
    const fullnameEl = document.getElementById("register-fullname");
    const emailEl = document.getElementById("register-email");
    const passwordEl = document.getElementById("register-password");
    const errorLabel = document.getElementById("register-errlabel");
    
    if (!fullnameEl.value || !fullnameEl.validity.valid) {
      errorLabel.textContent = "Invalid full name";
      errorLabel.setAttribute("iserror", "1");
      return;
    }
    
    if (!emailEl.value || !emailEl.validity.valid) {
      errorLabel.textContent = "Invalid email";
      errorLabel.setAttribute("iserror", "1");
      return;
    }
    
    if (!passwordEl.value || !passwordEl.validity.valid) {
      errorLabel.textContent = "Invalid password";
      errorLabel.setAttribute("iserror", "1");
      return;
    }
    
    errorLabel.setAttribute("iserror", "0");
  
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: fullnameEl.value,
        email: emailEl.value,
        password: passwordEl.value
      })
    };
      
    fetch(import.meta.env.VITE_API_URL + "/register", requestOptions)
      .then(response => response.json())
      .then(response => {
        if (response.status === false) {
          errorLabel.textContent = response.err_msg;
          errorLabel.setAttribute("iserror", "1");
          return;
        }

        localStorage.setItem("uuid", response.data.uuid);
        localStorage.setItem("fullname", response.data.fullname);
        sessionStorage.setItem("session-accepted", "1")
        navigate("/dash");
      })
      .catch(err => {
        errorLabel.textContent = "Failed to register.";
        errorLabel.setAttribute("iserror", "1");
        return;
      })
  }

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
      <div className="loginFormContainer">
        <div className="loginForm">
          <h1 className='panelName'>Register</h1>
          <div className='hzSep'></div>
          <div className='loginFormFields'>
            <InputGroup>
              <InputLabel>Full name</InputLabel>
              <Input id='register-fullname' type='text' placeholder='John Smith' minlen={3}></Input>
            </InputGroup>
            <InputGroup>
              <InputLabel>Email</InputLabel>
              <Input id='register-email' type='email' placeholder='example@email.com' minlen={3}></Input>
            </InputGroup>
            <InputGroup>
              <InputLabel>Password</InputLabel>
              <Input id='register-password' type='password' minlen={3}></Input>
            </InputGroup>
            <PrimaryButton wide onClick={handleRegister}>Register</PrimaryButton>
            <ErrorLabel id="register-errlabel"/>
          </div>
          <div className='hzSep'></div>
          <TertiaryButton wide onClick={() => {navigate('/login')}}>Login instead</TertiaryButton>
        </div>
      </div>
    </>
  )
}

