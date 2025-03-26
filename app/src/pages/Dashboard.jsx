import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import DashboardCategorySwitcher from '../components/dashCategorySwitcher.jsx'
import { useNavigate } from 'react-router-dom';
import { LogOut, ClipboardList, Users, Settings2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import './styles/dashboard.css'


export default function Dashboard() {
  const navigate = useNavigate();
  const fullname = localStorage.getItem("fullname") ?? "user"
  
  if (sessionStorage.getItem("session-accepted") == "0") {
    console.warn("Cannot enter dashboard without accepted session.");
    useEffect(() => {navigate("/")}, [])
  }
  
  function onLogout() {
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    
    fetch(import.meta.env.VITE_API_URL + "/logout/" + localStorage.getItem("uuid"), requestOptions)
    .then(response => response.json())
    .then(response => {
      sessionStorage.clear();
      localStorage.clear();
      navigate("/");
    })
    .catch(err => {
      sessionStorage.clear();
      localStorage.clear();
      navigate("/");
    });
  }

  const formsViewRef = useRef(0);
  const groupsViewRef = useRef(0);
  const accountViewRef = useRef(0);

  return (
    <main className='dash'>
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
            Welcome, <span id='welcome-msg-name'>{fullname}</span>
        </h1>
        <TertiaryButton onClick={onLogout}>
          <LogOut/>
          Logout
        </TertiaryButton>
      </header>

      <div className='dash-content-container'>
        <div className="dash-categories-container">
          <DashboardCategorySwitcher id="dash-cat-forms" viewRef={formsViewRef} isActive>
            <ClipboardList/>
            Forms
          </DashboardCategorySwitcher>
          <DashboardCategorySwitcher id="dash-cat-groups" viewRef={groupsViewRef}>
            <Users/>
            Groups
          </DashboardCategorySwitcher>
          <DashboardCategorySwitcher id="dash-cat-groups" viewRef={accountViewRef}>
            <Settings2/>
            Account
          </DashboardCategorySwitcher>
        </div>
        
        <div className='hzSepStrong'></div>

        <div className='dash-categories-content-container'>

          <div className='dash-category-content' ref={formsViewRef}>
            forms...
          </div>

          <div className='dash-category-content' ref={groupsViewRef} active="0">
            groups...
          </div>

          <div className='dash-category-content' ref={accountViewRef} active="0">
            account...
          </div>
          
        </div>
      </div>
    </main>
  )
}

