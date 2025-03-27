import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { ClipboardList, Users, Bolt, Trash2 } from 'lucide-react';
import FormBrief from './FormBrief.jsx';
import '../pages/styles/dashboard.css'


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
    </div>
  )


}

