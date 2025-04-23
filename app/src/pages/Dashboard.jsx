import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import DashboardCategorySwitcher from '../components/dashCategorySwitcher.jsx'
import FormBrief from '../components/FormBrief.jsx'
import ListView from '../components/ListView.jsx'
import { useNavigate } from 'react-router-dom';
import { LogOut, ClipboardList, Users, Settings2, ClipboardPlus, PlusCircle, ChevronRightCircle, Mail, Check, X, CodeSquare, Medal } from 'lucide-react';
import { ErrorLabel } from "../ui/ErrorLabel.jsx"
import { useEffect, useRef, useState } from 'react';
import { displayInfoMessage, displayWarnMessage } from '../components/Toasts.jsx'
import { GradingSchemasManager } from '../components/GradingSchemas.jsx';
import './styles/dashboard.css'
import './styles/_responsive.css'

function MyListsPanel({ lists, selectedList, onSwitchList }) {
  if (!lists) return <p>Loading...</p>;
  
  return (
    <>
      {
        lists.map((listData, index) => {
          return (
            <div key={listData.list_id}>
              <div 
                onClick={() => onSwitchList(listData)} 
                className='my-list' 
                id={'list-' + listData.list_id} 
                selected={Number(selectedList?.list_id == listData.list_id)}
              >
                <h3>{listData.name}</h3>
                <ChevronRightCircle/>
              </div>
  
              {
                (index != lists.length - 1) && <div className='hzSep'></div>
              }
            </div>
          )
        })
      }
    </>
  )
}


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
      displayInfoMessage("Logged out.");
      navigate("/");
    })
    .catch(err => {
      sessionStorage.clear();
      localStorage.clear();
      displayInfoMessage("Logged out.");
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
        displayInfoMessage("Full name updated.");
      } else {
        errorLabel.textContent = response.err_msg;
        errorLabel.setAttribute("iserror", "1");
      }
    })
    .catch(err => {      
      displayWarnMessage("Failed to update full name.")
      errorLabel.textContent = "Failed to update fullname.";
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
        displayInfoMessage("Password updated.");
      } else {
        errorLabel.textContent = response.err_msg;
        errorLabel.setAttribute("iserror", "1");
      }
    })
    .catch(err => {      
      displayWarnMessage("Failed to update password.");
      errorLabel.textContent = "Failed to update password.";
      errorLabel.setAttribute("iserror", "1");
    });
  }

  function switchList(listData) {
    setSelectedList(listData);
    document.querySelectorAll(".my-list").forEach(list => {list.setAttribute("selected", "0")})
    document.getElementById("list-" + listData.list_id).setAttribute("selected", "1");
  }

  function onListCreate() {
    const name = document.getElementById("create-list-name");
    if (!name.value || !name.validity.valid) return;

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        name: name.value
      })
    };
    
    fetch(import.meta.env.VITE_API_URL + "/lists/create", requestOptions)
    .then(response => response.json())
    .then(response => {
      if (response.status) {
        displayInfoMessage(`Created list ${name.value}`);
        setIsAddListOpen(false);
        fetchLists();
      }
    })
  }

  function onCreateForm() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid"))
      })
    };
    
    fetch(import.meta.env.VITE_API_URL + "/forms/create", requestOptions)
    .then(response => response.json())
    .then(response => {
      if (response.status) {
        const formId = response.data;
        navigate("/builder/" + formId);
      } else {
        displayWarnMessage(response.err_msg);
      }
    })
  }

  const formsViewRef = useRef(null);
  const listsViewRef = useRef(null);
  const schemasViewRef = useRef(null);
  const accountViewRef = useRef(null);
  const [selectedList, setSelectedList] = useState(null);
  const [lists, setLists] = useState(null);
  const [forms, setForms] = useState(null);

  const [isAddListOpen, setIsAddListOpen] = useState(false);

  const fetchLists = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/lists/fetch", requestOptions);
    const data = await response.json();

    if (data.status) {
      const myLists = data.data;
      setLists(myLists);

      if (myLists.length > 0) {
        setSelectedList(myLists[0]);
      }
      
    } 
  };
  useEffect(() => {fetchLists()}, []);

  const fetchForms = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/load-list", requestOptions);
    const data = await response.json();

    if (data.status) setForms(data.data);
  };
  useEffect(() => {fetchForms()}, []);


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
        <TertiaryButton small onClick={onLogout}>
          <LogOut/>Logout
        </TertiaryButton>
      </header>

      <div className='dash-content-container'>
        <div className="dash-categories-container">
          <DashboardCategorySwitcher viewRef={formsViewRef} isActive>
            <ClipboardList/>Forms
          </DashboardCategorySwitcher>
          <DashboardCategorySwitcher viewRef={listsViewRef}>
            <Users/>Lists
          </DashboardCategorySwitcher>
          <DashboardCategorySwitcher viewRef={schemasViewRef}>
            <Medal/>Grading schemas
          </DashboardCategorySwitcher>
          <DashboardCategorySwitcher viewRef={accountViewRef}>
            <Settings2/>Account
          </DashboardCategorySwitcher>
        </div>
        
        <div className='dash-categories-content-container'>
          <div className='dash-category-content' ref={formsViewRef}>
            <div className='dash-forms-category-container'>
              <h1>Assigned to me:</h1>
              <div className="dash-forms-container">
                {
                  (forms && forms.assigned.length > 0) ? (
                    forms.assigned.map((formId) => (
                      <FormBrief isAssigned formId={formId} key={formId}></FormBrief>
                    ))  
                  ) : (
                    <p className='info-text'>There are no forms assigned to Your email.</p>
                  )
                }
              </div>
            </div>
            <div className='dash-forms-category-container'>
              <h1>
                My forms:
                <PrimaryButton onClick={onCreateForm}>
                  <ClipboardPlus/>Create
                </PrimaryButton>
              </h1>
              <div className="dash-forms-container">
                {
                  (forms && forms.my_forms.length > 0) ? (
                    forms.my_forms.map((formId) => (
                      <FormBrief isMyForm formId={formId} key={formId}></FormBrief>
                    ))  
                  ) : (
                    <p className='info-text'>You don't have any forms yet.</p>
                  )
                }
              </div>
            </div>
            <div className='dash-forms-category-container'>
              <h1>Answered by me:</h1>
              <div className="dash-forms-container">
                {
                  (forms && forms.answered.length > 0) ? (
                    forms.answered.map((formId) => (
                      <FormBrief isAnswered formId={formId} key={formId}></FormBrief>
                    ))  
                  ) : (
                    <p className='info-text'>You have not answered any form yet.</p>
                  )
                }
              </div>
            </div>
          </div>

          <div className='dash-category-content' ref={listsViewRef} active="0">
            <div className='lists-category-container'>
              <div className='my-lists-container'>
                <div className='my-lists-header'>
                  <h1>My lists</h1>
                  <TertiaryButton small onClick={() => {setIsAddListOpen(true)}}>
                    <PlusCircle/>New
                  </TertiaryButton>
                  {
                    isAddListOpen && (
                      <Modal title="Create list" close={setIsAddListOpen}>
                        <InputGroup>
                          <InputLabel>List name</InputLabel>
                          <Input id="create-list-name" minlen={3}></Input>
                        </InputGroup>
                        <PrimaryButton wide onClick={onListCreate}><PlusCircle/>Create</PrimaryButton>
                      </Modal>
                    )
                  }
                </div>
                <div className='hzSepMid'></div>
                <div className='my-lists'>
                  <MyListsPanel lists={lists} selectedList={selectedList} onSwitchList={switchList}/>
                </div>
              </div>
              <div className='list-details'>
                <h1>{selectedList?.name ?? '-'}</h1>
                <div className='hzSepMid'></div>
                <ListView refreshPanel={() => {setSelectedList(null); fetchLists()}} listNameSetter={(name) => {setSelectedList({...selectedList, name: name}); fetchLists()}} listData={selectedList}/>
              </div>
            </div>
          </div>

          <div className='dash-category-content' ref={schemasViewRef} active="0">
            <GradingSchemasManager/>
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
