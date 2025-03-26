import { KeyRound, LockKeyholeIcon, VenetianMask, Edit3, CornerDownRight, Eye, EyeOff, User, Users, CalendarClock, Medal, CheckCheck, Hourglass } from 'lucide-react';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import '../pages/styles/dashboard.css'


const characteristicsIcons = {
  author: User,
  date: CalendarClock,
  anonymous: VenetianMask,
  password: LockKeyholeIcon,
  grade: Medal,
  target: Users,
  submitted: CheckCheck,
  timelimit: Hourglass
}


export default function FormBrief({ isAssigned=false, isMyForm=false, isAnswered=false, formId }) {
  //TODO: fetch form data
  const formName = "A long form name..."
  let isResultHidden = false;
  let myFormState = 0;
  let characteristics = [
    {
      type: "author",
      content: "Some author"
    },
    {
      type: "date",
      content: "Since [02 march 15:30]"
    },
    {
      type: "anonymous",
      content: "Answers are [anonymous]"
    },
    {
      type: "grade",
      content: "Manually graded"
    }
  ]

  return (
    <div className="form-brief-view" isfinished={Number(isAnswered)} isfeatured={Number(isAssigned)}>
      <h5>{formName}</h5>
      <div className='hzSepMid'></div>
      <div className='form-brief-characteristics-container'>

        {
          characteristics.map((characteristic, index) => {
            const Icon = characteristicsIcons[characteristic.type];
            return (
              <div className='form-characteristic' key={index}>
                {Icon && <Icon/>}
                <span dangerouslySetInnerHTML={{ __html: characteristic.content.replaceAll("[", '<span class="bold-text">').replaceAll("]", "</span>") }} />
              </div>
            )
          })
        }

        <div className='form-brief-active-state-badge' state={myFormState}>
          {
            (isMyForm) ? (
              ["Not active", "Pending...", "Active"][myFormState]
            ) : (<></>)
          }
        </div>

        <div className='form-brief-btn-container'>
          {
            (isMyForm) ? (
              <SecondaryButton>
                <Edit3/>
                Manage
              </SecondaryButton>
            ) : (
              (isAnswered) ? (
                (isResultHidden) ? (
                  <TertiaryButton>
                    <Eye/>
                    My response
                  </TertiaryButton>
                ) : (
                  <TertiaryButton>
                    <EyeOff/>
                    Response hidden
                  </TertiaryButton>
                )
              ) : (
                <PrimaryButton>
                  <CornerDownRight/>
                  Answer
                </PrimaryButton>
              )
            )
          }
        </div>
      </div>
    </div>
  )
}

