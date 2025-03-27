import { DangerButton, PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { ClipboardList, Users, Bolt, Trash2, Settings, DoorOpen, Edit3, Mail } from 'lucide-react';
import FormBrief from './FormBrief.jsx';
import '../pages/styles/dashboard.css'
import { Input, InputGroup, InputLabel } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import { useState, useEffect } from 'react';


function GroupMember({ name, memberUUID, isMemberManager, isUserManager }) {
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
                <Bolt color='red' />
              ) : (
                <Bolt color='var(--color-primary-muted)' />
              )
            }
            <Trash2 color='red'/>
          </div>
        )
      }
    </div>
  )
}

export default function GroupView({ groupId=null }) {
  if (groupId==null) return <></>

  const [groupData, setGroupData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
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

        console.log(data)
        if (data.status) setGroupData(data.data);
      } catch (error) {
        console.error("Error fetching group:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) return <p>Loading...</p>;
  
  return (
    <div className="group-view-container">
      <h2><ClipboardList/>Forms</h2>
      <div className='group-view-forms-container'>
        {
          groupData.assigned_forms.map(formId => {
            return (<FormBrief isAssigned formId={formId} key={formId}></FormBrief>)
          })
        }
        {
          groupData.draft_forms.map(formId => {
            return groupData.is_manager && (<FormBrief isMyForm formId={formId} key={formId}></FormBrief>)
          })
        }
      </div>
      
      <h2><Users/>Members ({groupData.members.length + groupData.managers.length})</h2>
      <div className='group-view-forms-container'>
        {
          groupData.managers.map(memberData => {
            let [memberName, memberUUID] = memberData;
            return (<GroupMember name={memberName} memberUUID={memberUUID} isMemberManager={true} isUserManager={groupData.is_manager} key={memberUUID}></GroupMember>)
          })
        }
        {
          groupData.members.map(memberData => {
            let [memberName, memberUUID] = memberData;
            return (<GroupMember name={memberName} memberUUID={memberUUID} isMemberManager={false} isUserManager={groupData.is_manager} key={memberUUID}></GroupMember>)
          })
        }
      </div>

      <h2><Settings/>Manage</h2>
      <div className='group-view-management-container'>
        {
          groupData.is_manager && (
            <>
              <div className='row'>
                <InputGroup>
                  <InputLabel>Send invitation</InputLabel>
                  <Input type="email" id="invite-email" placeholder="user@email.com" minlen={3}></Input>
                  <TertiaryButton>
                    <Mail/>
                    Invite
                  </TertiaryButton>
                </InputGroup>
                <InputGroup>
                  <InputLabel>Rename group</InputLabel>
                  <Input type="text" id="new-group-name" placeholder="Fantastic group" minlen={3}></Input>
                  <TertiaryButton>
                    <Edit3/>
                    Rename
                  </TertiaryButton>
                </InputGroup>
              </div>
              <div className='hzSepMid'></div>
            </>
          )
        }
        <div className='row'>
          <DangerButton>
            <DoorOpen></DoorOpen>
            Leave group
          </DangerButton>
          {
            groupData.is_owner && (
              <DangerButton>
                <Trash2></Trash2>
                Remove group
              </DangerButton>
            )
          }
        </div>
      </div>
    </div>
  )




}

