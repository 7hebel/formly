import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input } from '../ui/Input.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { LockKeyholeIcon, VenetianMask, EyeOff, User, Users, CalendarClock, Medal, CheckCheck, Hourglass, Hash, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';
import './styles/answer.css'
import butterup from 'butteruptoasts';
import 'butteruptoasts/src/butterup.css';

function displayMessage(content) {
    butterup.toast({
      message: content,
      location: 'bottom-center',
      dismissable: true,
    });
}


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

export default function Answer() {
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;
  
  const [formSettings, setFormSettings] = useState("");
  const [characteristics, setCharacteristics] = useState([]);
  const [formStructure, setFormStructure] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      setCharacteristics(data.data.characteristics);
      setFormSettings(data.data.settings);
    }
  };
  useEffect(() => {fetchFormData()}, []);
  
  useEffect(() => {
    const savedUuid = localStorage.getItem('uuid');
    if (!savedUuid) return;

    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };

    fetch(import.meta.env.VITE_API_URL + "/autologinCheck/" + savedUuid, requestOptions)
      .then(response => response.json())
      .then(response => {
        if (response.status === false) {
          localStorage.setItem('uuid', "");
          setIsLoggedIn(false);
        } else {
          localStorage.setItem("fullname", response.data.fullname);
          localStorage.setItem("email", response.data.email);
          setIsLoggedIn(true);
        }
      })
      .catch(err => {
        localStorage.setItem('uuid', "");
        setIsLoggedIn(false);
      });
  }, []);

  const validateRespondent = async () => {
    const fullname = document.getElementById("resp-fullname");
    const email = document.getElementById("resp-email");
    const password = document.getElementById("form-password")?.value;
    
    if (fullname !== null && email !== null) {
      if (!fullname?.value || !fullname?.validity.valid) return;
      if (!email?.value || !email?.validity.valid) return;
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        form_id: formId,
        is_account: isLoggedIn,
        uuid: String(localStorage.getItem("uuid")),
        email: email?.value,
        fullname: fullname?.value,
        password: password,
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/validate-respondent", requestOptions);
    const data = await response.json();

    if (!data.status) {
      displayMessage(data.err_msg);
    } else {
      //TODO: continue...
      setFormStructure(data.data);
    }
  };

  return (
    <main className='answer'>
      <div className='squaresBgContainer'>
        <Squares 
          speed={0.25} 
          squareSize={40}
          direction='diagonal'
          borderColor='#f2eedd'
          hoverFillColor='transparent'
        />
      </div>

      <div className='form-info-panel'>
        <h1>
          <ClipboardList/>{formSettings.title}
        </h1>
        <div className='hzSepMid'></div>
        <div className='form-characteristics'>
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
        </div>
      </div>
      <div className='respondent-info'>
        {
          (isLoggedIn) ? (
            <div className='respondent-account'>
              <User/>Responding as: <span id='respondent-name'>{localStorage.getItem("fullname")}</span>
              <span id='change-logged-respondent' onClick={() => {setIsLoggedIn(false)}}>(change)</span>
            </div>
          ) : (
            <div className='respondent-no-account'>
              <InputGroup>
                <InputLabel>Full name</InputLabel>
                <Input type="text" id="resp-fullname" minlen={3}></Input>
              </InputGroup>
              <InputGroup>
                <InputLabel>Your email</InputLabel>
                <Input type="email" id="resp-email" minlen={3}></Input>
              </InputGroup>
              <span id='already-user' onClick={() => {navigate('/login')}}>Login instead.</span>
            </div>
          )
        }
        <div className='hzSep'></div>
        {
          (formSettings.password) ? (
            <>
              <InputGroup>
                <InputLabel>Form password</InputLabel>
                <Input type='password' id="form-password"></Input>
              </InputGroup>
              <div className='hzSep'></div>
            </>
          ) : (<></>)
        }

        <PrimaryButton wide onClick={validateRespondent}>Start</PrimaryButton>
      </div>

    </main>
  )
}

