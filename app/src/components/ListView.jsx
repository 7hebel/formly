import { DangerButton, PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { ClipboardList, Trash2, MailPlus, Edit3, AtSign, PlusCircle, MailMinus } from 'lucide-react';
import { Input, InputGroup, InputLabel } from '../ui/Input.jsx';
import { ErrorLabel } from '../ui/ErrorLabel.jsx';
import { useState, useEffect } from 'react';
import FormBrief from './FormBrief.jsx';
import { Modal } from '../ui/Modal.jsx';
import '../pages/styles/dashboard.css'
import butterup from 'butteruptoasts';
import 'butteruptoasts/src/butterup.css';


function displayMessage(content) {
    butterup.toast({
      message: content,
      location: 'bottom-center',
      dismissable: true,
    });
}

export default function ListView({ refreshPanel, listNameSetter, listData=null }) {
  if (!listData) return <p className='info-text text-center'>Select a list to view details.</p>

  const [renameOpen, setRenameOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [listEmails, setListEmails] = useState(listData.emails);
  useEffect(() => {
    setListEmails(listData.emails);
  }, [listData]);

  async function onListRename() {
    const newName = document.getElementById("new-list-name");
    if (!newName.value || !newName.validity.valid) { return; };
    
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        list_id: listData.list_id,
        new_name: newName.value
      }),
    };

    await fetch(import.meta.env.VITE_API_URL + "/lists/rename", requestOptions);
    listNameSetter(newName.value);
    newName.value = "";
    setRenameOpen(false);
  }

  async function onListRemove() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        list_id: listData.list_id,
      }),
    };

    await fetch(import.meta.env.VITE_API_URL + "/lists/remove", requestOptions);
    displayMessage(`Removed ${listData.name}`);
    refreshPanel();
  }

  async function onRemoveFromList(email) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        list_id: listData.list_id,
        email: email
      }),
    };

    await fetch(import.meta.env.VITE_API_URL + "/lists/remove-email", requestOptions);
    setListEmails(listEmails.filter(e => e != email));
  }

  async function onAddToList() {
    const email = document.getElementById("add-to-list-email");
    const emailError = document.getElementById("add-to-list-error");
    if (!email.value || !email.validity.valid) { 
      emailError.textContent = "Invalid email";
      emailError.setAttribute("iserror", "1");
      return; 
    };
    
    if (listData.emails.includes(email.value)) {
      emailError.textContent = "Email already on list.";
      emailError.setAttribute("iserror", "1");
      return; 
    }

    emailError.setAttribute("iserror", "0");

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        list_id: listData.list_id,
        email: email.value.toLowerCase()
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/lists/insert-email", requestOptions);
    const data = await response.json();
    if (data.status) {
      displayMessage(`Added ${email.value}`);
      setListEmails([...listEmails, email.value.toLowerCase()]);
      email.value = "";
    } else {
      emailError.textContent = data.err_msg;
      emailError.setAttribute("iserror", "1");
    }
  }

  
  return (
    <div className="list-view-container" key={listData.list_id}>
      <div className='row right-content'>
        <TertiaryButton small onClick={() => {setRenameOpen(true)}}>
          <Edit3/>Rename
        </TertiaryButton>
        {
          renameOpen && (
            <Modal title="Rename" close={setRenameOpen}>
              <InputGroup>
                <InputLabel>Rename list</InputLabel>
                <Input type="text" id="new-list-name" placeholder="Students" minlen={3}></Input>
              </InputGroup>
              <PrimaryButton wide onClick={onListRename}><Edit3/>Rename</PrimaryButton>
            </Modal>
          )
        }
        <DangerButton small onClick={() => {setRemoveOpen(true)}}>
          <Trash2/>Delete
        </DangerButton>
        {
          removeOpen && (
            <Modal title="Remove list?" close={setRemoveOpen}>
              <p className='info-text'>Group <b>{listData.name}</b> will be irreversibly deleted. <br></br>Forms assigned to this list will remain.</p>
              <div className='row wide'>
                <TertiaryButton wide onClick={() => {setRemoveOpen(false)}}>Cancel</TertiaryButton>
                <DangerButton wide onClick={onListRemove}>Delete</DangerButton>
              </div>
            </Modal>
          )
        }
      </div>
      <h2><ClipboardList/>Forms</h2>
      <div className='list-view-forms-container'>
        {
          listData.forms.map(formId => (
            <FormBrief isMyForm formId={formId} key={formId}></FormBrief>
          ))
        }
        {
          (listData.forms.length == 0) ? (
            <p className='info-text'>There are no forms assigned to this list.</p>
          ) : <></>
        }
      </div>
      
      <h2>
        <AtSign/>Emails
        <div className='right-content'>
          <PrimaryButton onClick={() => {setAddOpen(true)}}>
            <PlusCircle/>Add to list
          </PrimaryButton>
        </div>
        {
          addOpen && (
            <Modal title="Add emails to list." close={setAddOpen}>
              <InputGroup>
                <InputLabel>Email</InputLabel>
                <Input type='email' id="add-to-list-email" minlen={3}></Input>
                <ErrorLabel id='add-to-list-error'></ErrorLabel>
              </InputGroup>
              <PrimaryButton wide onClick={onAddToList}><MailPlus/>Add</PrimaryButton>
            </Modal>
          )
        }  
      </h2>
      
      <div className='list-view-members' key={listEmails}>
        {
          listEmails.length > 0 ? <p className='info-text total-emails'>{listEmails.length} Emails</p> : null
        }
        {
          listEmails.length > 0 ? (
            listEmails.map(email => (
              <div className='list-member' key={email}>
                <p>{email}</p>
                <Trash2 className='icon-btn' onClick={() => {onRemoveFromList(email)}}/>
              </div>
            ))
          ) : (
            <p className='info-text text-center'>There are no emails on this list yet.</p>
          )
        }
      </div>
    </div>
  )
}

