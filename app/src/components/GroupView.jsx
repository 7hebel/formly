import { DangerButton, PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { ClipboardList, Users, Bolt, Trash2, Settings, DoorOpen, Edit3, Mail } from 'lucide-react';
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


function GroupMember({ name, memberUUID, isMemberManager, isUserManager, onKick, onChangePromotion }) {
  const isSelf = memberUUID == String(localStorage.getItem("uuid"));
  
  return (
    <div className='group-member' manager={Number(isMemberManager)} id={memberUUID}>
      { isMemberManager && <Bolt/> }
      <p isself={Number(isSelf)}>{name}</p>
      {
        isUserManager && !isSelf && (
          <div className='group-member-manage-icons'>
            {
              (isMemberManager) ? (
                <Bolt color='red' onClick={() => {onChangePromotion(memberUUID)}} />
              ) : (
                <Bolt color='var(--color-primary-muted)' onClick={() => {onChangePromotion(memberUUID)}} />
              )
            }
            <Trash2 color='red' onClick={() => {onKick(memberUUID)}}/>
          </div>
        )
      }
    </div>
  )
}

export default function GroupView({ refreshPanel, groupNameSetter, groupId=null }) {
  if (!groupId) return <p className='info-text text-center'>Select a group to view details.</p>

  const [groupData, setGroupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitationOpen, setInvitationOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const fetchGroupData = async () => {
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid: String(localStorage.getItem("uuid")),
          group_id: groupId
        }),
      };

      const response = await fetch(import.meta.env.VITE_API_URL + "/groups/fetch", requestOptions);
      const data = await response.json();

      if (data.status) setGroupData(data.data);
    } catch (error) {
      console.error("Error fetching group:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);


  async function onInviteSend() {
    const email = document.getElementById("invite-email");
    const errorLabel = document.getElementById("invite-email-error");
    if (!email.value || !email.validity.valid) {
      errorLabel.textContent = "Invalid email.";
      errorLabel.setAttribute("iserror", "1");
      return;
    };
    
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        invite_email: email.value,
        group_id: groupId,
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/groups/invite", requestOptions);
    const data = await response.json();

    if (data.status) {
      errorLabel.setAttribute("iserror", "0");
      displayMessage(`Invited ${data.data}`);
      email.value = "";

    } else {
      errorLabel.textContent = data.err_msg;
      errorLabel.setAttribute("iserror", "1");
    }
    
  }

  async function onGroupRename() {
    const newName = document.getElementById("new-group-name");
    if (!newName.value || !newName.validity.valid) { return; };
    
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        group_id: groupId,
        new_name: newName.value
      }),
    };

    await fetch(import.meta.env.VITE_API_URL + "/groups/rename", requestOptions);
    groupNameSetter(newName.value);
    newName.value = "";
    setRenameOpen(false);
  }

  async function onGroupLeave() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        group_id: groupId,
      }),
    };

    await fetch(import.meta.env.VITE_API_URL + "/groups/leave", requestOptions);
    setLoading(true);
    refreshPanel();
  }

  async function onKick(memberUUID) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        group_id: groupId,
        member_uuid: memberUUID
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/groups/kick", requestOptions);
    const data = await response.json();
    if (!data.status) {
      return displayMessage(data.err_msg);
    }

    setLoading(true);
    await fetchGroupData();
  }

  async function onChangePromotion(memberUUID, state=true) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        group_id: groupId,
        member_uuid: memberUUID
      }),
    };

    const endpoint = (state) ? "promote" : "demote";
    const response = await fetch(import.meta.env.VITE_API_URL + "/groups/" + endpoint, requestOptions);
    const data = await response.json();
    if (data.status) {
      setLoading(true);
      await fetchGroupData();
    } else {
      displayMessage(data.err_msg);
    }
  }

 
  if (loading) return <></>;
  
  return (
    <div className="group-view-container">
      <h2><ClipboardList/>Forms</h2>
      <div className='group-view-forms-container'>
        {
          groupData.assigned_forms.map(formId => (<FormBrief isAssigned formId={formId} key={formId}></FormBrief>))
        }
        {
          groupData.draft_forms.map(formId => (
            groupData.is_manager && (<FormBrief isMyForm formId={formId} key={formId}></FormBrief>)
          ))
        }
        {
          (groupData.assigned_forms.length == 0 && groupData.draft_forms.length == 0) ? (
            <p className='info-text'>There are no forms assigned to this group.</p>
          ) : <></>
        }
      </div>
      
      <h2><Users/>Members ({groupData.members.length + groupData.managers.length})</h2>
      <div className='group-view-forms-container'>
        {
          groupData.managers.map(memberData => {
            let [memberName, memberUUID] = memberData;
            return (
              <GroupMember
                name={memberName}
                memberUUID={memberUUID}
                isMemberManager={true} 
                isUserManager={groupData.is_manager} 
                key={memberUUID}
                onKick={onKick}
                onChangePromotion={(memberUUID) => {onChangePromotion(memberUUID, false)}}
                ></GroupMember>
              )
          })
        }
        {
          groupData.members.map(memberData => {
            let [memberName, memberUUID] = memberData;
            return (
              <GroupMember
                name={memberName}
                memberUUID={memberUUID}
                isMemberManager={false}
                isUserManager={groupData.is_manager}
                key={memberUUID}
                onKick={onKick}
                onChangePromotion={(memberUUID) => {onChangePromotion(memberUUID, true)}}
              ></GroupMember>
            )
          })
        }
      </div>

      <h2><Settings/>Manage</h2>
      <div className='group-view-management-container'>
        {
          groupData.is_manager && (
            <>
              <div className='row'>
                <SecondaryButton onClick={() => {setInvitationOpen(true)}}>
                  <Mail/>Invite members
                </SecondaryButton>
                {
                  invitationOpen && (
                    <Modal title="Invite member" close={setInvitationOpen}>
                      <InputGroup>
                        <InputLabel>Send invitation</InputLabel>
                        <Input type="email" id="invite-email" placeholder="user@email.com" minlen={3}></Input>
                      </InputGroup>
                      <PrimaryButton wide onClick={onInviteSend}><Mail/>Invite</PrimaryButton>
                      <ErrorLabel id='invite-email-error'></ErrorLabel>
                    </Modal>
                  )
                }
                
                <SecondaryButton onClick={() => {setRenameOpen(true)}}>
                  <Edit3/>Rename group
                </SecondaryButton>
                {
                  renameOpen && (
                    <Modal title="Rename group" close={setRenameOpen}>
                      <InputGroup>
                        <InputLabel>New group name</InputLabel>
                        <Input type="text" id="new-group-name" placeholder="My fantastic group" minlen={3}></Input>
                      </InputGroup>
                      <PrimaryButton wide onClick={onGroupRename}><Edit3/>Rename</PrimaryButton>
                    </Modal>
                  )
                }
              </div>
              <div className='hzSepMid'></div>
            </>
          )
        }
        <div className='row'>
          {
            (groupData.is_owner) ? (
              <DangerButton onClick={onGroupLeave}>
                <Trash2/>Remove group
              </DangerButton>
            ) : (
              <DangerButton onClick={onGroupLeave}>
                <DoorOpen/>Leave group
              </DangerButton>
            )
          }
        </div>
      </div>
    </div>
  )
}

