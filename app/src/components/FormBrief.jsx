import { LockKeyholeIcon, VenetianMask, Edit3, CornerDownRight, Eye, EyeOff, User, Users, CalendarClock, Medal, CheckCheck, Hourglass } from 'lucide-react';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import '../pages/styles/dashboard.css'
import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';


const characteristicsIcons = {
  author: User,
  date: CalendarClock,
  anonymous: VenetianMask,
  password: LockKeyholeIcon,
  grade: Medal,
  assign: Users,
  submitted: CheckCheck,
  timelimit: Hourglass,
  hidden_answers: EyeOff
}


export default function FormBrief({ isAssigned=false, isMyForm=false, isAnswered=false, formId }) {
  const navigate = useNavigate();
  
  let isResultHidden = false;

  const [formName, setFormName] = useState("");
  const [characteristics, setCharacteristics] = useState([]);
  const [myFormState, setMyFormState] = useState(0);

  const fetchFormData = async () => {
    if (!formId) return;
    
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        form_id: formId
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/fetch-form", requestOptions);
    const data = await response.json();

    if (data.status) {
      const settings = data.data.settings;
      setCharacteristics(data.data.characteristics);
      setFormName(settings.title);
      if (settings.is_active) { setMyFormState(2); } // 1 for pending, not supported yet.
    }
  };
  useEffect(() => {fetchFormData()}, []);
  


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
              <SecondaryButton onClick={() => {navigate('/builder/' + formId)}}>
                <Edit3/>Manage
              </SecondaryButton>
            ) : (
              (isAnswered) ? (
                (isResultHidden) ? (
                  <TertiaryButton>
                    <Eye/>My response
                  </TertiaryButton>
                ) : (
                  <TertiaryButton>
                    <EyeOff/>Response hidden
                  </TertiaryButton>
                )
              ) : (
                <PrimaryButton>
                  <CornerDownRight/>Answer
                </PrimaryButton>
              )
            )
          }
        </div>
      </div>
    </div>
  )
}

