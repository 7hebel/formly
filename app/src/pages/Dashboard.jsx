import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import DashboardCategorySwitcher from '../components/dashCategorySwitcher.jsx'
import FormBrief from '../components/FormBrief.jsx'
import GroupView from '../components/GroupView.jsx'
import { useNavigate } from 'react-router-dom';
import { LogOut, ClipboardList, Users, Settings2, ClipboardPlus, PlusCircle, ChevronRightCircle, Mail, Check, X } from 'lucide-react';
import { ErrorLabel } from "../ui/ErrorLabel.jsx"
import { useEffect, useRef, useState } from 'react';
import './styles/dashboard.css'


export default function Dashboard() {
  const navigate = useNavigate();

  const fullname = localStorage.getItem("fullname") ?? ""
  const email = localStorage.getItem("email") ?? ""
  
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

  function onFullnameUpdate() {
    const newName = document.getElementById("update-fullname");
    const errorLabel = document.getElementById("update-fullname-errlabel");

    if (!newName.value || !newName.validity.valid) {
      errorLabel.textContent = "Invalid full name.";
      errorLabel.setAttribute("iserror", "1");
      return;
    }
    
    errorLabel.setAttribute("iserror", "0");

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        fullname: newName.value
      })
    };
    
    fetch(import.meta.env.VITE_API_URL + "/account-update/fullname", requestOptions)
    .then(response => response.json())
    .then(response => {
      if (response.status) {
        errorLabel.setAttribute("iserror", "0");
        localStorage.setItem("fullname", newName.value);
        newName.value = "";
        navigate("/dash");
      } else {
        errorLabel.textContent = response.err_msg;
        errorLabel.setAttribute("iserror", "1");
      }
    })
    .catch(err => {      
      errorLabel.textContent = "Failed to update fullname.";
      errorLabel.setAttribute("iserror", "1");
    });
  }

  function onEmailUpdate() {
    const newMail = document.getElementById("update-email");
    const errorLabel = document.getElementById("update-email-errlabel");

    if (!newMail.value || !newMail.validity.valid) {
      errorLabel.textContent = "Invalid email.";
      errorLabel.setAttribute("iserror", "1");
      return;
    }
    
    errorLabel.setAttribute("iserror", "0");

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        email: newMail.value
      })
    };
    
    fetch(import.meta.env.VITE_API_URL + "/account-update/email", requestOptions)
    .then(response => response.json())
    .then(response => {
      if (response.status) {
        errorLabel.setAttribute("iserror", "0");
        localStorage.setItem("email", newMail.value);
        newMail.value = "";
        navigate("/dash");
      } else {
        errorLabel.textContent = response.err_msg;
        errorLabel.setAttribute("iserror", "1");
      }
    })
    .catch(err => {      
      errorLabel.textContent = "Failed to update email.";
      errorLabel.setAttribute("iserror", "1");
    });
  }

  function onPasswordUpdate() {
    const newPassword = document.getElementById("update-password");
    const currentPassword = document.getElementById("update-password-current");
    const errorLabel = document.getElementById("update-password-errlabel");

    if (!newPassword.value || !newPassword.validity.valid) {
      errorLabel.textContent = "Invalid password.";
      errorLabel.setAttribute("iserror", "1");
      return;
    }
    
    errorLabel.setAttribute("iserror", "0");

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        new_password: newPassword.value,
        current_password: currentPassword.value,
      })
    };
    
    fetch(import.meta.env.VITE_API_URL + "/account-update/password", requestOptions)
    .then(response => response.json())
    .then(response => {
      if (response.status) {
        errorLabel.setAttribute("iserror", "0");
        newPassword.value = "";
        currentPassword.value = "";
      } else {
        errorLabel.textContent = response.err_msg;
        errorLabel.setAttribute("iserror", "1");
      }
    })
    .catch(err => {      
      errorLabel.textContent = "Failed to update password.";
      errorLabel.setAttribute("iserror", "1");
    });
  }

  function switchGroup(name, groupId) {
    setSelectedGroupName(name);
    setSelectedGroup(groupId);
    document.querySelectorAll(".my-group").forEach(group => {group.setAttribute("selected", "0")})
    document.getElementById("group-" + groupId).setAttribute("selected", "1");
  }

  const formsViewRef = useRef(0);
  const groupsViewRef = useRef(0);
  const accountViewRef = useRef(0);
  let [selectedGroup, setSelectedGroup] = useState(null);
  let [selectedGropName, setSelectedGroupName] = useState("-");

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
          <DashboardCategorySwitcher viewRef={formsViewRef} isActive>
            <ClipboardList/>
            Forms
          </DashboardCategorySwitcher>
          <DashboardCategorySwitcher viewRef={groupsViewRef}>
            <Users/>
            Groups
          </DashboardCategorySwitcher>
          <DashboardCategorySwitcher viewRef={accountViewRef}>
            <Settings2/>
            Account
          </DashboardCategorySwitcher>
        </div>
        
        <div className='hzSepStrong'></div>
        <div className='dash-categories-content-container'>

          <div className='dash-category-content' ref={formsViewRef}>
            <div className='dash-forms-category-container'>
              <h1>Assigned to me:</h1>
              <div className="dash-forms-container">

                <FormBrief isAssigned></FormBrief>

              </div>
            </div>
            <div className='dash-forms-category-container'>
              <h1>
                My forms:
                <PrimaryButton>
                  <ClipboardPlus/>
                  Create
                </PrimaryButton>
              </h1>
              <div className="dash-forms-container">

                <FormBrief isMyForm></FormBrief>
                <FormBrief isMyForm></FormBrief>
                <FormBrief isMyForm></FormBrief>

              </div>
            </div>
            <div className='dash-forms-category-container'>
              <h1>Answered by me:</h1>
              <div className="dash-forms-container">

                <FormBrief isAnswered></FormBrief>
                <FormBrief isAnswered></FormBrief>

              </div>
            </div>
          </div>

          <div className='dash-category-content' ref={groupsViewRef} active="0">
            <div className='groups-category-container'>
              <div className='my-groups-container'>
                <div className='my-groups-header'>
                  <h1>My groups</h1>
                  <PrimaryButton>
                    <PlusCircle/>
                    Add
                  </PrimaryButton>
                </div>
                <div className='hzSepStrong'></div>
                <div className='my-groups'>

                  <div className='group-invitation'>
                    <small>
                      <Mail/>
                      Invite
                    </small>
                    <h4>Some group awjdiawoi iojaw diojwd aowija awdoijadoijwdaj doij dawj</h4>
                    <div className='row'>
                      <PrimaryButton wide>
                        <Check/>
                        Join
                      </PrimaryButton>
                      <DangerButton wide>
                        <X/>
                        Reject
                      </DangerButton>
                    </div>
                  </div>

                  <div className='hzSepMid'></div>
                  <div onClick={() => {switchGroup('Group name test abc', '1')}} className='my-group' id='group-1' selected="0">
                    <h3>Group name test abc</h3>
                    <ChevronRightCircle/>
                  </div>
                  <div className='hzSepMid'></div>
                  <div onClick={() => {switchGroup('Another group name', '2')}} className='my-group' id='group-2' selected="1">
                    <h3>Another group name</h3>
                    <ChevronRightCircle/>
                  </div>
                  <div className='hzSepMid'></div>
                  <div onClick={() => {switchGroup('Long long long long long long long long long group name', '3')}} className='my-group' id='group-3' selected="0">
                    <h3>Long long long long long long long long long group name</h3>
                    <ChevronRightCircle/>
                  </div>

                </div>
              </div>
              <div className='group-details'>
                <h1>{selectedGropName}</h1>
                <div className='hzSepStrong'></div>
                <GroupView groupId={selectedGroup}/>
              </div>
            </div>
          </div>

          <div className='dash-category-content' ref={accountViewRef} active="0">
            <div className='dash-account-container'>
              <h1>{fullname}</h1>
              <h4>{email}</h4>
              <div className='dash-account-edits-container'>
                <div className='dash-account-edit-panel'>
                  <InputGroup>
                    <InputLabel>Full name</InputLabel>
                    <Input id='update-fullname' placeholder={fullname} minlen={3}></Input>
                    <TertiaryButton onClick={onFullnameUpdate}>Update</TertiaryButton>
                  </InputGroup>
                  <ErrorLabel id="update-fullname-errlabel"/>
                </div>
                <div className='vSep'></div>
                <div className='dash-account-edit-panel'>
                  <InputGroup>
                    <InputLabel>Email</InputLabel>
                    <Input id='update-email' type="email" placeholder={email} minlen={3}></Input>
                    <TertiaryButton onClick={onEmailUpdate}>Update</TertiaryButton>
                  </InputGroup>
                  <ErrorLabel id="update-email-errlabel"/>
                </div>
                <div className='vSep'></div>
                <div className='dash-account-edit-panel'>
                  <InputGroup>
                    <InputLabel>Password</InputLabel>
                    <Input id='update-password' type="password" minlen={3}></Input>
                  </InputGroup>
                  <InputGroup>
                    <InputLabel>Current password</InputLabel>
                    <Input id='update-password-current' type="password" minlen={3}></Input>
                    <TertiaryButton onClick={onPasswordUpdate}>Update</TertiaryButton>
                  </InputGroup>
                  <ErrorLabel id="update-password-errlabel"/>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  )
}
