import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { TrueFalse } from '../ui/TrueFalse.jsx';
import { Modal } from '../ui/Modal.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { LogOut, CheckCheck, Settings2, ClipboardList, VenetianMask, Type, Hourglass, UserCheck, LockKeyhole, TextCursorInput, Text, Binary, ToggleRight, CircleCheck, SquareCheck, DoorClosed } from 'lucide-react';
import { ErrorLabel } from "../ui/ErrorLabel.jsx"
import { useEffect, useRef, useState } from 'react';
import butterup from 'butteruptoasts';
import 'butteruptoasts/src/butterup.css';
import './styles/builder.css'


function displayMessage(content) {
  butterup.toast({
    message: content,
    location: 'bottom-center',
    dismissable: true,
  });
}


export default function FormBuilder() {
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;

  if (!formId) return navigate("/dash")

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const fetchFormData = async () => {
    try {
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
      
      if (data.status) setFormData(data.data);
      
      setFormName(data.data.settings.title);
      setIsAnon(data.data.settings.is_anonymous);
      setIsAccountRequired(data.data.settings.accounts_only);
      setFormPassword(data.data.settings.password);
  
      
    } catch (error) {
      displayMessage("Failed to load form.");
      navigate("/dash");
      
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFormData();
  }, [formId]);
  
  const [formName, setFormName] = useState("Form");
  const [isAnon, setIsAnon] = useState(false);
  const [isAccountRequired, setIsAccountRequired] = useState(true);
  const [formPassword, setFormPassword] = useState(null);
  
  function updateName(event) {
    if (!event.target.value || !event.target.validity.valid) return;
    setFormName(event.target.value);
  }
  
  async function sendSave() {
    const structure = [];
    const settings = {
      "title": formName,
      "is_anonymous": isAnon,
      "time_limit_m": parseInt(document.getElementById("form-ans-time-limit").value) || 0,
      "password": document.getElementById("form-password").value,
      "accounts_only": isAccountRequired
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        form_id: formId,
        settings: settings,
        structure: structure
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/update-form", requestOptions);
    const data = await response.json();
    if (data.status) {
      displayMessage("Saved!");
    } else {
      displayMessage("Failed to save, " + data.err_msg);
    }

  }

  async function onLeave() {
    //TODO: alert - no save

  }

  if (loading) return <>Loading {formId}</>;
  
  return (
    <main className='builder'>
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
      <img src='../logo.svg' height={42} onClick={() => {navigate('/')}}></img>
      <h1 className='welcome-msg'>
        Form <span id='welcome-msg-name'>builder</span>
      </h1>
      <div className='row'>
        <PrimaryButton onClick={sendSave}>
          <CheckCheck/>Save
        </PrimaryButton>

        <TertiaryButton onClick={() => {setIsLeaveModalOpen(true)}}>
          <LogOut/>Leave
        </TertiaryButton>
        {
          isLeaveModalOpen && (
            <Modal title="Leave form builder?" close={setIsLeaveModalOpen}>
              <InputLabel>You might have unsaved changes.</InputLabel>
              <div className='row wide'>
                <PrimaryButton wide onClick={() => {setIsLeaveModalOpen(false)}}>Stay</PrimaryButton>
                <DangerButton wide onClick={() => {navigate('/dash')}}>Leave</DangerButton>
              </div>
            </Modal>
          )
        }
      </div>
      </header>

      <div className='builder-panels-container'>
        <div className='builder-properties-panel'>
          <div className='builder-panel-header'>
            <Settings2/>
            <h2>Properties</h2>
          </div>
          <div className='hzSepMid'></div>
          <div className='builder-properties-container'>
            <InputGroup>
              <InputLabel>
               <Type/>Form name
              </InputLabel>
              <Input onChange={updateName} placeholder={formData.settings.title} minlen={1} maxlen={32}></Input>
            </InputGroup>
            <div className='hzSep'></div>
            <InputGroup>
              <InputLabel>
                <VenetianMask/>Anonymous answers
              </InputLabel>
              <TrueFalse qid="anon-answers" defValueState={isAnon} setter={setIsAnon}></TrueFalse>
            </InputGroup>
            <div className='hzSep'></div>
            <InputGroup>
              <InputLabel>
               <Hourglass/>Answer time limit
              </InputLabel>
              <div className='row'>
                <Input type='number' id='form-ans-time-limit' value={formData.settings.time_limit_m}></Input>
                <p className='input-unit'>Minutes.</p>
              </div>
            </InputGroup>
            <div className='hzSep'></div>
            <InputGroup>
              <InputLabel>
                <UserCheck/>Require Formly account
              </InputLabel>
              <TrueFalse qid="require-account" defValueState={isAccountRequired} setter={setIsAccountRequired}></TrueFalse>
            </InputGroup>
            <div className='hzSep'></div>
            <InputGroup>
              <InputLabel>
                <LockKeyhole/>Password
              </InputLabel>
              <Input type='password' id='form-password' value={formPassword}></Input>
            </InputGroup>
            <div className='hzSep'></div>
          </div>
        </div>

        <div className='builder-form-panel'>
          <div className='builder-panel-header'>
            <ClipboardList/>
            <h2>{formName}</h2>
          </div>
          <div className='hzSepMid'></div>
          <div className='builder-form-content'>

            <div className='builder-new-blocks'>
              <div className='add-component-btn'>
                <TextCursorInput/>Short text answer
              </div>
              <div className='add-component-btn'>
                <Text/>Long text answer
              </div>
              <div className='add-component-btn'>
                <Binary/>Numeric answer
              </div>
              <div className='add-component-btn'>
                <ToggleRight/>True / False
              </div>
              <div className='add-component-btn'>
                <CircleCheck/>Select single option
              </div>
              <div className='add-component-btn'>
                <SquareCheck/>Select multiple options
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
    )

}
  