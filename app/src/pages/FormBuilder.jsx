import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { MultiSelect } from '../ui/Select.jsx';
import { TrueFalse } from '../ui/TrueFalse.jsx';
import { Modal } from '../ui/Modal.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { LogOut, CheckCheck, Settings2, ClipboardList, VenetianMask, Type, Hourglass, UserCheck, LockKeyhole, TextCursorInput, Text, Binary, ToggleRight, CircleCheck, SquareCheck, UserPlus, Send, MinusCircle, Users, Mail, PlusCircle, EyeOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getComponentBuilder } from "../formComponents/AllComponents.jsx"
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

function generateComponentId() {
  return Date.now() + "" + Math.random();
}


export default function FormBuilder() {
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;

  if (!formId) return navigate("/dash")

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [authorGroups, setAuthorGroups] = useState([]);

  const fetchAuthorGroups = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/groups/get-assignable", requestOptions);
    const data = await response.json();

    if (data.status) {
      let authorGroupsOptions = [];

      for (let [groupKey, groupName] of data.data) {
        authorGroupsOptions.push({
          id: groupKey,
          value: groupName
        })
      }

      setAuthorGroups(authorGroupsOptions);
    }

  };
  
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
      setHideAnswers(data.data.settings.hide_answers);
      setIsAssignedOnly(data.data.settings.assigned_only);
      setFormPassword(data.data.settings.password);
      setFormComponents(data.data.structure);
      setAssignedEmails(data.data.assigned.emails);
      setAssignedGroups(data.data.assigned.groups);

    } catch (error) {
      displayMessage("Failed to load form.");
      navigate("/dash");
      
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {fetchAuthorGroups()}, []);
  useEffect(() => {fetchFormData()}, [formId]);
  
  const [formName, setFormName] = useState("Form");
  const [isAnon, setIsAnon] = useState(false);
  const [hideAnswers, setHideAnswers] = useState(false);
  const [isAssignedOnly, setIsAssignedOnly] = useState(true);
  const [formPassword, setFormPassword] = useState(null);
  const [formComponents, setFormComponents] = useState([]);
  const [assignedEmails, setAssignedEmails] = useState([]);
  const [assignedGroups, setAssignedGroups] = useState([]);

  function handleAssignEmail() {
    const email = document.getElementById("assign-email");
    if (!email.value || !email.validity.valid) return;

    if (assignedEmails.includes(email.value)) {
      email.value = "";
      return;
    }

    setAssignedEmails([...assignedEmails, email.value]);
    email.value = "";
  }

  function handleUnassignEmail(email) {
    const newAssignedEmails = [];
    for (const assignedEmail of assignedEmails) {
      if (assignedEmail !== email) newAssignedEmails.push(assignedEmail);
    }
    setAssignedEmails(newAssignedEmails);
  }

  function updateName(event) {
    if (!event.target.value || !event.target.validity.valid) return;
    setFormName(event.target.value);
  }

  function grabComponentsData() {
    const data = [];
    document.querySelectorAll(".form-component").forEach((componentEl) => {
      data.push(JSON.parse(componentEl.getAttribute("_componentdata")));
    })
    return data;
  }

  async function sendSave() {
    const structure = grabComponentsData();
    const settings = {
      "title": formName,
      "is_anonymous": isAnon,
      "time_limit_m": parseInt(document.getElementById("form-ans-time-limit").value) || 0,
      "password": document.getElementById("form-password").value,
      "assigned_only": isAssignedOnly,
      "hide_answers": hideAnswers
    };
    const assigned = {
      "groups": assignedGroups,
      "emails": assignedEmails
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        form_id: formId,
        settings: settings,
        structure: structure,
        assigned: assigned
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/update-form", requestOptions);
    const data = await response.json();
    if (data.status) { displayMessage("Saved!"); }
    else { displayMessage("Failed to save, " + data.err_msg); }

  }

  function addFormComponent(componentType) {
    setFormComponents([...formComponents, {"componentType": componentType, "componentId": generateComponentId()}]);
  }

  function onGroupAssignChange(event) {
    const groupId = event.target.getAttribute("optionkey");
    const state = event.target.checked;

    if (state && !assignedGroups.includes(groupId)) {
      const newAssignedGroups = [...assignedGroups, groupId];
      setAssignedGroups(newAssignedGroups); 
    }

    if (!state && assignedGroups.includes(groupId)) {
      const newAssignedGroups = [];
      for (const assignedGroup of assignedGroups) {
        if (assignedGroup !== groupId) newAssignedGroups.push(assignedGroup);
      }
      setAssignedGroups(newAssignedGroups);
    }
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
            <div className='builder-properties-top'>
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
                <div className='input-with-action'>
                  <Input type='number' id='form-ans-time-limit' value={formData.settings.time_limit_m}></Input>
                  <p className='input-unit'>Minutes.</p>
                </div>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <InputLabel>
                  <EyeOff/>Hide asnwers
                </InputLabel>
                <TrueFalse qid="hide-answers" defValueState={hideAnswers} setter={setHideAnswers}></TrueFalse>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <InputLabel>
                  <LockKeyhole/>Password
                </InputLabel>
                <Input type='password' id='form-password' value={formPassword}></Input>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <InputLabel>
                  <UserCheck/>Assigned respondents only
                </InputLabel>
                <TrueFalse qid="assigned-only" defValueState={isAssignedOnly} setter={setIsAssignedOnly}></TrueFalse>
              </InputGroup>
              <div className='hzSep'></div>
            </div>
          </div>
          <div className='builder-properties-bottom row'>
            <TertiaryButton wide onClick={() => {setIsAssignModalOpen(true)}}>
              <UserPlus/>Assign
            </TertiaryButton>
            {
              isAssignModalOpen && (
                <Modal title="Assign form." close={setIsAssignModalOpen}>
                  <div className='assign-categories-container'>
                    <div className='assign-category'>
                      <h3>
                        <Users/>Groups
                      </h3>
                      <div className='hzSep'></div>
                      <div className='assignees-container'>
                        <MultiSelect
                          qid="assign-groups"
                          options={authorGroups}
                          selectedIds={assignedGroups}
                          onOptionChange={onGroupAssignChange}
                        ></MultiSelect>
                      </div>
                    </div>
                    <div className='assign-category'>
                      <h3>
                        <Mail/>Emails
                      </h3>
                      <div className='hzSep'></div>
                      <div className='assignees-container'>
                        {
                          assignedEmails.map((email) => (
                            <div className='assignee-item' key={email}>
                              <p>{email}</p>
                              <MinusCircle onClick={() => {handleUnassignEmail(email)}}/>
                            </div>
                          ))
                        }
                      </div>
                      <InputGroup>
                        <InputLabel>Assign to email</InputLabel>
                        <div className='input-with-action'>
                          <Input type='email' id="assign-email"></Input>
                          <div className='assign-btn' onClick={handleAssignEmail}>
                            <PlusCircle/>
                          </div>
                        </div>
                      </InputGroup>
                    </div>
                  </div>
                </Modal>
              )
            }

            <PrimaryButton wide>
              <Send/>Deploy
            </PrimaryButton>
          </div>
        </div>

        <div className='builder-form-panel'>
          <div className='builder-panel-header'>
            <ClipboardList/><h2>{formName}</h2>
          </div>
          <div className='hzSepMid'></div>
          <div className='builder-form-content'>

            {
              formComponents.map((componentData, qIndex) => {
                const DynamicComponentBuilder = getComponentBuilder(componentData.componentType)  ;
                return (
                  <DynamicComponentBuilder 
                    key={componentData.componentId} 
                    questionNo={qIndex + 1} 
                    formComponents={formComponents}
                    setFormComponents={setFormComponents}
                    {...componentData}
                  ></DynamicComponentBuilder>
                )
              })
            }

            <div className='builder-new-blocks'>
              <div className='add-component-btn' onClick={() => {addFormComponent("short-text-answer")}}>
                <TextCursorInput/>Short text answer
              </div>
              <div className='add-component-btn' onClick={() => {addFormComponent("long-text-answer")}}>
                <Text/>Long text answer
              </div>
              <div className='add-component-btn' onClick={() => {addFormComponent("numeric-answer")}}>
                <Binary/>Numeric answer
              </div>
              <div className='add-component-btn' onClick={() => {addFormComponent("truefalse-answer")}}>
                <ToggleRight/>True / False
              </div>
              <div className='add-component-btn' onClick={() => {addFormComponent("single-select-answer")}}>
                <CircleCheck/>Select single option
              </div>
              <div className='add-component-btn' onClick={() => {addFormComponent("multi-select-answer")}}>
                <SquareCheck/>Select multiple options
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    )

}
  