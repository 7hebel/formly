import { LockKeyholeIcon, VenetianMask, Edit3, CornerDownRight, Eye, EyeOff, User, Users, CalendarClock, Medal, CheckCheck, Hourglass, Hash } from 'lucide-react';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import '../pages/styles/dashboard.css'
import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { FormResponse } from './FormResponse.jsx';
import { Modal } from '../ui/Modal.jsx';
import { GradeCircle } from "../components/GradeCircle.jsx"

const characteristicsIcons = {
  author: User,
  date: CalendarClock,
  anonymous: VenetianMask,
  password: LockKeyholeIcon,
  grade: Medal,
  assign: Users,
  submitted: CheckCheck,
  timelimit: Hourglass,
  hidden_answers: EyeOff,
  questions_count: Hash,
}


export default function FormBrief({ isAssigned=false, isMyForm=false, isAnswered=false, formId }) {
  const navigate = useNavigate();
  
  const [formName, setFormName] = useState("");
  const [characteristics, setCharacteristics] = useState([]);
  const [myFormState, setMyFormState] = useState(0);
  const [isResultHidden, setIsResultHidden] = useState(true);
  const [isResponseOpen, setIsResponseOpen] = useState(false)
  const [formData, setFormData] = useState(null);


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

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/get-brief", requestOptions);
    const data = await response.json();

    if (data.status) {
      setFormData(data.data);
      console.log(data.data)

      const settings = data.data.settings;
      setCharacteristics(data.data.characteristics);
      setFormName(settings.title);
      setIsResultHidden(settings.hide_answers);
      if (settings.is_active) { setMyFormState(2); } // 1 for pending, not supported yet.

    }
  };
  useEffect(() => {fetchFormData()}, []);
  

  return (
    <div className="form-brief-view" isfinished={Number(isAnswered)} isfeatured={Number(isAssigned)}>
      <div className='form-brief-header'>
        <h5>{formName}</h5>
        {
          (isAnswered && formData?.graded) && 
          (
            !isNaN(parseInt(formData.graded.percentage)) ? (
                <GradeCircle initialValue={formData.graded.percentage} schemaGrade={formData.graded.schema}></GradeCircle>
              ) : (
                <GradeCircle initialValue={0} schemaGrade="?"></GradeCircle>
            )
          )
        }
      </div>
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
              <SecondaryButton small onClick={() => {navigate('/builder/' + formId)}}>
                <Edit3/>Manage
              </SecondaryButton>
            ) : (
              (isAnswered) ? (
                (!isResultHidden) ? (
                  <>
                    <TertiaryButton small onClick={() => {setIsResponseOpen(true)}}>
                      <Eye/>My response
                    </TertiaryButton>
                    {
                      isResponseOpen? (
                        <Modal title="My response" close={setIsResponseOpen}>
                          <FormResponse formId={formId} responseData={formData.answer} formComponents={formData.structure}></FormResponse>
                        </Modal>
                      ) : null
                    }
                  </>
                ) : (
                  <p className='info-text'>Response hidden</p>
                )
              ) : (
                <PrimaryButton small onClick={() => {navigate("/form/" + formId)}}>
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

