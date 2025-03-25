import { useNavigate } from "react-router-dom";
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input } from '../ui/Input.jsx';
import './styles/login.css'


export function LoginPanel() {
  const navigate = useNavigate();
  
  return (
    <div className="loginFormContainer">
      <h1 className='panelName'>Login</h1>
      <div className='hzSep'></div>
      <div className='loginFormFields'>
        <InputGroup>
          <InputLabel>Email</InputLabel>
          <Input id='login-email' type='email' placeholder='example@email.com'></Input>
        </InputGroup>
        <InputGroup>
          <InputLabel>Password</InputLabel>
          <Input id='login-password' type='password' minlen={3}></Input>
        </InputGroup>
        <PrimaryButton wide>Login</PrimaryButton>
      </div>
      <div className='hzSep'></div>
      <TertiaryButton wide onClick={() => {navigate('/register')}}>Create account</TertiaryButton>
    </div>
  )
}

export function RegisterPanel() {
  const navigate = useNavigate();
  
  return (
    <div className="loginFormContainer">
      <h1 className='panelName'>Register</h1>
      <div className='hzSep'></div>
      <div className='loginFormFields'>
        <InputGroup>
          <InputLabel>Full name</InputLabel>
          <Input id='register-fullname' type='text' placeholder='John Smith' minlen={3}></Input>
        </InputGroup>
        <InputGroup>
          <InputLabel>Email</InputLabel>
          <Input id='register-email' type='email' placeholder='example@email.com'></Input>
        </InputGroup>
        <InputGroup>
          <InputLabel>Password</InputLabel>
          <Input id='register-password' type='password' minlen={3}></Input>
        </InputGroup>
        <PrimaryButton wide>Register</PrimaryButton>
      </div>
      <div className='hzSep'></div>
      <TertiaryButton wide onClick={() => {navigate('/login')}}>Login instead</TertiaryButton>
    </div>
  )
}

