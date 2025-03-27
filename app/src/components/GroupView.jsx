import { DangerButton, PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { ClipboardList, Users, Bolt, Trash2, Settings, DoorOpen, Edit3, Mail } from 'lucide-react';
import FormBrief from './FormBrief.jsx';
import '../pages/styles/dashboard.css'
import { Input, InputGroup, InputLabel } from '../ui/Input.jsx';


function GroupMember({ name, memberUUID, isMemberManager, isUserManager }) {
  return (
    <div className='group-member' manager={Number(isMemberManager)} id={memberUUID}>
      { isMemberManager && <Bolt/> }
      <p>{name}</p>
      {
        isUserManager && (
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
  //TODO: fetch group data

  const isOwner = true;
  const isManager = true;
  const managers = [
    ['Jan Kowalski', 'idJan'],
    ['Bartek Jakiś', 'idBar']
  ];
  const members = [
    ['Użytkownik 1', 'idU1'],
    ['Stefan Kuleczka', 'idSte'],
    ['Grzegorz grzegżółka', 'idG'],
  ];
  const assignedForms = [
    'formid1', 'formid2'
  ];
  const draftFroms = [
    'formid3'
  ]

  return (
    <div className="group-view-container">
      <h2>
        <ClipboardList/>
        Forms
      </h2>
      <div className='group-view-forms-container'>
        {
          assignedForms.map(formId => {
            return (<FormBrief isAssigned formId={formId} key={formId}></FormBrief>)
          })
        }
        {
          draftFroms.map(formId => {
            return isManager && (<FormBrief isMyForm formId={formId} key={formId}></FormBrief>)
          })
        }
      </div>
      
      <h2>
        <Users/>
        Members ({members.length + managers.length})
      </h2>
      <div className='group-view-forms-container'>
        {
          managers.map(memberData => {
            let [memberName, memberUUID] = memberData;
            return (<GroupMember name={memberName} memberUUID={memberUUID} isMemberManager={true} isUserManager={isManager}></GroupMember>)
          })
        }
        {
          members.map(memberData => {
            let [memberName, memberUUID] = memberData;
            return (<GroupMember name={memberName} memberUUID={memberUUID} isMemberManager={false} isUserManager={isManager}></GroupMember>)
          })
        }
      </div>


      <h2>
        <Settings/>
        Manage
      </h2>
      <div className='group-view-management-container'>
        {
          isManager && (
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
            isOwner && (
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

