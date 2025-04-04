import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { MultiSelect } from '../ui/Select.jsx';
import { TrueFalse } from '../ui/TrueFalse.jsx';
import { Modal } from '../ui/Modal.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { LogOut, CheckCheck, Settings2, ClipboardList, VenetianMask, Type, Hourglass, UserCheck, LockKeyhole, TextCursorInput, Text, Binary, ToggleRight, CircleCheck, SquareCheck, UserPlus, Send, MinusCircle, Users, Mail, PlusCircle, EyeOff, Ban, Link, Copy, Eye, ArrowLeft, RefreshCcw, ChevronRight, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getComponentBuilder } from "../formComponents/AllComponents.jsx"
import { FormResponse } from "../components/FormResponse.jsx";
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAnswersView, setIsAnswersView] = useState(false);
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
      setIsActive(data.data.settings.is_active);
      setAssignedEmails(data.data.assigned.emails);
      setAssignedGroups(data.data.assigned.groups);
      setCurrentlyResponding(data.data.responding);
      setResponses(data.data.answers);

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
  const [isActive, setIsActive] = useState(false);
  const [formPassword, setFormPassword] = useState(null);
  const [formComponents, setFormComponents] = useState([]);
  const [assignedEmails, setAssignedEmails] = useState([]);
  const [assignedGroups, setAssignedGroups] = useState([]);
  const [currentlyResponding, setCurrentlyResponding] = useState({});
  const [responses, setResponses] = useState({});
  const [viewedResponse, setViewedResponse] = useState(null);

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

  async function sendSave() {
    const structure = formComponents;
    const settings = {
      "title": formName,
      "is_anonymous": isAnon,
      "time_limit_m": Math.max(parseInt(document.getElementById("form-ans-time-limit").value), 0) || 0,
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
    setFormComponents([...formComponents, {"componentType": componentType, "componentId": crypto.randomUUID(), "points": 1}]);
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

  async function startForm() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        form_id: formId,
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/start", requestOptions);
    const data = await response.json();
    if (data.status) { 
      setIsActive(true);
      displayMessage("Form is now active.");
    }
    else { displayMessage("Failed to start, " + data.err_msg); }
  }

  async function endForm() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        form_id: formId,
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/end", requestOptions);
    const data = await response.json();
    if (data.status) { 
      setIsActive(false);
      displayMessage("Form is now: not active.");
    }
    else { displayMessage("Failed to end, " + data.err_msg); }
  }

  function switchResponseDetailsTarget(email) {
    responses[email].email = email;
    setViewedResponse(responses[email]);
  }

  async function refreshResponses() {
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
    setCurrentlyResponding(data.data.responding);
    setResponses(data.data.answers);
    displayMessage("Refreshed");
  }
  
  async function removeForm() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        form_id: formId
      }),
    };
  
    await fetch(import.meta.env.VITE_API_URL + "/forms/remove-form", requestOptions);
    navigate("/dash");
    displayMessage(`Deleted ${formName}`);

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
        <TertiaryButton onClick={sendSave}>
          <CheckCheck/>Save
        </TertiaryButton>

        <DangerButton onClick={() => {setIsLeaveModalOpen(true)}}>
          <LogOut/>Leave
        </DangerButton>
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
                  <LockKeyhole/>Password
                </InputLabel>
                <Input type='password' id='form-password' value={formPassword}></Input>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <InputLabel>
                  <Hourglass/>Answer time limit
                </InputLabel>
                <div className='input-with-action'>
                  <Input type='number' id='form-ans-time-limit' value={formData.settings.time_limit_m} min={0}></Input>
                  <p className='input-unit'>Minutes.</p>
                </div>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <InputLabel>
                  <VenetianMask/>Anonymous answers
                </InputLabel>
                <TrueFalse qid="anon-answers" defValueState={isAnon} setter={setIsAnon} isDimmed></TrueFalse>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <InputLabel>
                  <EyeOff/>Hide answers after response
                </InputLabel>
                <TrueFalse qid="hide-answers" defValueState={hideAnswers} setter={setHideAnswers} isDimmed></TrueFalse>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <InputLabel>
                  <UserCheck/>Assigned respondents only
                </InputLabel>
                <TrueFalse qid="assigned-only" defValueState={isAssignedOnly} setter={setIsAssignedOnly} isDimmed></TrueFalse>
              </InputGroup>
              <div className='hzSep'></div>
              <p className='danger-text-btn' onClick={() => {setIsDeleteModalOpen(true)}}>
                <Trash2/>Delete form
              </p>
              {
                isDeleteModalOpen && (
                  <Modal title="Delete form?" close={setIsDeleteModalOpen}>
                    <InputLabel>Form's properties and structure will be irreversibly deleted!</InputLabel>
                    <div className='row wide'>
                      <PrimaryButton wide onClick={() => {setIsDeleteModalOpen(false)}}>Back</PrimaryButton>
                      <DangerButton wide onClick={removeForm}>Delete</DangerButton>
                    </div>
                  </Modal>
                )
              }
              <div className='hzSep'></div>

            </div>
          </div>
          <div className='builder-properties-bottom'>
            <TertiaryButton wide onClick={() => {setIsAnswersView(true)}}>
              <Eye/>View responses
            </TertiaryButton>
          </div>
          <div className='builder-properties-bottom row'>
            <SecondaryButton wide onClick={() => {setIsAssignModalOpen(true)}}>
              <UserPlus/>Assign
            </SecondaryButton>
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

            <PrimaryButton wide onClick={() => {setIsShareModalOpen(true)}}>
              <Send/>Deploy
            </PrimaryButton>
            {
              isShareModalOpen && (
                <Modal title="Share form." close={setIsShareModalOpen}>
                  <div className='share-form-content'>
                    <span className='is-active-info'>Form is {(isActive) ? 'active' : 'not active'}</span>
                    <div className='hzSep'></div>
                    <div className='link-container'>
                      <span className='link-header row'>
                        <Link/>URL
                      </span>
                      <span className='link-content'>{window.location.host}/form/{formId}</span>
                      <span className='link-copy row' onClick={() => {navigator.clipboard.writeText(window.location.host + "/form/" + formId); displayMessage("Copied!")}}>
                        <Copy/>Copy
                      </span>
                    </div>
                    <InputLabel>Assigned Formly users can access this form from their dashboards.</InputLabel>
                    <div className='hzSep'></div>
                    {
                      !isActive? (
                        <PrimaryButton wide onClick={startForm}>
                          <Send/>Start now
                        </PrimaryButton>
                      ) : (
                        <DangerButton wide onClick={endForm}>
                          <Ban/>End now
                        </DangerButton>
                      )
                    }
                  </div>
                </Modal>
              )
            }
          </div>
        </div>

        <div className='builder-form-panel'>
          <div className='builder-panel-header'>
            <ClipboardList/><h2>{formName}</h2>
          </div>
          <div className='hzSepMid'></div>
          {
            isAnswersView ? (
              <>
                <div className='responses-view-header'>
                  <span className='responses-view-header-btn' onClick={() => {setIsAnswersView(false)}}>
                    <ArrowLeft/>Back to builder
                  </span>
                  Manage responses
                  <span className='responses-view-header-btn' onClick={refreshResponses}>
                    <RefreshCcw/>Refresh
                  </span>
                </div>
                <div className='responses-view'>
                  <div className='responses-lists'>
                    <div className='responses-type-header'>Currently responding: <span className='header-value'>{Object.keys(currentlyResponding).length}</span></div>
                    <div className='currently-responding-container'>
                      {
                        Object.entries(currentlyResponding).map(([email, data]) => (
                          <span className='currently-responding' key={email}>{data.fullname} ({email})</span>
                        ))
                      }
                    </div>
                    <div className='hzSep'></div>
                    <div className='responses-type-header'>Submitted responses: <span className='header-value'>{Object.keys(responses).length}</span></div>
                    <div className='submitted-responses-container'>
                      {
                        Object.entries(responses).map(([email, data]) => (
                          <div className='submitted-response' key={email} onClick={() => {switchResponseDetailsTarget(email)}}>
                            <div className='submitted-respondent-info'>
                              <span className='respondent-name'>{data.fullname}</span>
                              <span className='respondent-email'>{email}</span>
                            </div>
                            <div className='submitted-response-right'>
                              <span className='response-grade' id={"resp-grade-" + data.response_id}>{data.grade}</span>
                              <ChevronRight/>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  {
                    viewedResponse? (
                      <FormResponse formId={formId} responseData={viewedResponse} formComponents={formComponents} onRemoved={() => {setViewedResponse(null); refreshResponses()}} withGradePanel></FormResponse>
                    ) : (<></>)
                  }
                </div>
              </>
            ) : (
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
                      locked
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
            )
          }
        </div>
      </div>
    </main>
    )

}
  