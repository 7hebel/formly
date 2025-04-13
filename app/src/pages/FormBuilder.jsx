import Squares from '../blocks/Backgrounds/Squares.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton } from '../ui/Button.jsx';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { DropdownGroup, DropdownItem } from '../ui/Dropdown.jsx';
import { MultiSelect } from '../ui/Select.jsx';
import { Switch } from '../ui/Swtich.jsx';
import { Modal } from '../ui/Modal.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings2, ClipboardList, VenetianMask, Type, Hourglass, UserCheck, LockKeyhole, TextCursorInput, Text, Binary, ToggleRight, CircleCheck, SquareCheck, UserPlus, Send, MinusCircle, Users, Mail, PlusCircle, EyeOff, Ban, Link, Copy, Eye, ArrowLeft, RefreshCcw, ChevronRight, Trash2, LayoutDashboard, Trophy, ChartPie, ChartNoAxesCombinedIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getComponentBuilder } from "../formComponents/AllComponents.jsx"
import { FormResponse } from "../components/FormResponse.jsx";
import butterup from 'butteruptoasts';
import 'butteruptoasts/src/butterup.css';
import './styles/builder.css'
import { isEqual } from 'lodash';
import { AnimatePresence, motion } from 'framer-motion';


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

  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAnswersView, setIsAnswersView] = useState(false);
  const [authorLists, setAuthorLists] = useState([]);
  const refreshIconRef = useRef(null);

  const fetchAuthorLists = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/lists/fetch", requestOptions);
    const data = await response.json();

    if (data.status) {
      let authorLists = [];

      for (let listData of data.data) {
        authorLists.push({
          id: listData.list_id,
          value: listData.name
        })
      }
      setAuthorLists(authorLists);
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
      
      if (data.status) {
        setFormComponents(data.data.structure);
        setFormSettings(data.data.settings);
        setAssigned(data.data.assigned);
        setCurrentlyResponding(data.data.responding);
        setResponses(data.data.answers);
      }

    } catch (error) {
      displayMessage("Failed to load form.");
      navigate("/dash");
      
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {fetchAuthorLists()}, []);
  useEffect(() => {fetchFormData()}, [formId]);
  
  const [formSettings, setFormSettings] = useState({
    is_anonymous: false,
    hide_answers: false,
    assigned_only: true,
    is_active: false,
    password: null,
    title: '-'
  });
  
  const [assigned, setAssigned] = useState({
    emails: [],
    lists: []
  });

  const [formComponents, setFormComponents] = useState([]);
  const [currentlyResponding, setCurrentlyResponding] = useState({});
  const [responses, setResponses] = useState({});
  const [viewedResponse, setViewedResponse] = useState(null);
  const [gradingSchemas, setGradingSchemas] = useState({});
  const previousSentDataRef = useRef(null);

  function handleAssignEmail() {
    const email = document.getElementById("assign-email");
    if (!email.value || !email.validity.valid) return;

    if (assigned.emails.includes(email.value)) {
      email.value = "";
      return;
    }

    setAssigned({...assigned, emails: [...assigned.emails, email.value]});
    email.value = "";
  }

  function handleUnassignEmail(email) {
    const newAssignedEmails = [];
    for (const assignedEmail of assigned.emails) {
      if (assignedEmail !== email) newAssignedEmails.push(assignedEmail);
    }
    setAssigned({...assigned, emails: newAssignedEmails})
  }

  function updateName(event) {
    if (!event.target.value || !event.target.validity.valid) return;
    setFormSettings({...formSettings, title: event.target.value});
  }

  function updateTimeLimit(event) {
    if (!event.target.validity.valid) return;
    const validTimeLimit = Math.max(parseInt(event.target.value), 0) || 0;
    setFormSettings({...formSettings, time_limit_m: validTimeLimit});
  }

  function _getSaveData() {
    const saveData = {
      "uuid": String(localStorage.getItem("uuid")),
      "form_id": formId,
      "settings": formSettings,
      "structure": formComponents,
      "assigned": assigned
    }

    return saveData;
  }

  async function sendSave(_, diffCheck=false) {
    const saveData = _getSaveData();
    
    if (diffCheck && isEqual(saveData, previousSentDataRef.current)) return;
    previousSentDataRef.current = saveData;
    
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saveData)
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/update-form", requestOptions);
    const data = await response.json();
    if (!data.status) { displayMessage("Failed to save, " + data.err_msg); }
  }

  useEffect(() => {
    if (previousSentDataRef.current === null) {
      previousSentDataRef.current = _getSaveData();
    }
    
    const interval = setInterval(() => {
      sendSave(true, true);
    }, 1000);
    return () => clearInterval(interval);
  }, [formComponents, formSettings, assigned]);
  

  function addFormComponent(componentType) {
    setFormComponents([...formComponents, {"componentType": componentType, "componentId": crypto.randomUUID(), "points": 1}]);
  }

  function onListAssignChange(event) {
    const listId = event.target.getAttribute("optionkey");
    const state = event.target.checked;

    if (state && !assigned.lists.includes(listId)) {
      setAssigned({...assigned, lists: [...assigned.lists, listId]})
    }

    if (!state && assigned.lists.includes(listId)) {
      const newAssignedLists = [];
      for (const assignedList of assigned.lists) {
        if (assignedList !== listId) newAssignedLists.push(assignedList);
      }
      setAssigned({...assigned, lists: newAssignedLists})
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
      setFormSettings({...formSettings, is_active: true});
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
      setFormSettings({...formSettings, is_active: false});
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
    
    setCurrentlyResponding(data.data.responding);
    setResponses(data.data.answers);
    refreshIconRef.current.style.rotate = ((parseInt(refreshIconRef.current.style.rotate) || 0) + 360) + "deg";
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
    displayMessage(`Deleted ${formSettings.title}`);

  }

  async function loadGradingSchemas() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
      }),
    };
    
    const response = await fetch(import.meta.env.VITE_API_URL + "/grading-schemas/fetch", requestOptions);
    const data = await response.json();
    setGradingSchemas(data.data);
  }

  useEffect(() => {loadGradingSchemas()}, []);
  
  if (loading) return <p className='info-text'>Loading {formId}</p>;
  
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
      <img src='../logo.svg' height={42} onClick={() => {sendSave().finally(() => {navigate('/')})}}></img>
      <h1 className='welcome-msg'>
        Form <span id='welcome-msg-name'>builder</span>
      </h1>
      <div className='row'>
        <TertiaryButton onClick={() => {navigate('/dash')}}>
          <LayoutDashboard/>Dashboard
        </TertiaryButton>
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
                <Input onChange={updateName} value={formSettings.title} minlen={1} maxlen={32}></Input>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <InputLabel>
                  <LockKeyhole/>Password
                </InputLabel>
                <Input type='password' id='form-password' onChange={(c) => {setFormSettings({...formSettings, "password": c.target.value})}} value={formSettings.password}></Input>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <InputLabel>
                  <Hourglass/>Answer time limit
                </InputLabel>
                <div className='input-with-action'>
                  <Input type='number' id='form-ans-time-limit' onChange={updateTimeLimit} value={formSettings.time_limit_m} min={0}></Input>
                  <p className='input-unit'>Minutes.</p>
                </div>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <div className='row wide'>
                  <InputLabel>
                    <VenetianMask/>Anonymous answers
                  </InputLabel>
                  <div className='right-content'>
                    <Switch checked={formSettings.is_anonymous} onChange={(isAnon) => {setFormSettings({...formSettings, is_anonymous: isAnon})}}></Switch>
                  </div>
                </div>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <div className='row wide'>
                  <InputLabel>
                    <EyeOff/>Hide answers after response
                  </InputLabel>
                  <div className='right-content'>
                    <Switch checked={formSettings.hide_answers} onChange={(hide) => {setFormSettings({...formSettings, hide_answers: hide})}}></Switch>
                  </div>
                </div>
              </InputGroup>
              <div className='hzSep'></div>
              <InputGroup>
                <div className='row wide'>
                  <InputLabel>
                    <UserCheck/>Assigned respondents only
                  </InputLabel>
                  <div className='right-content'>
                    <Switch checked={formSettings.assigned_only} onChange={(assignedOnly) => {setFormSettings({...formSettings, assigned_only: assignedOnly})}}></Switch>
                  </div>
                </div>
              </InputGroup>
              <div className='hzSep'></div>
              <InputLabel>
                <Trophy/>Grading schema
              </InputLabel>
              <DropdownGroup key={JSON.stringify(gradingSchemas)} items={gradingSchemas} selectedItemID={formSettings.grading_schema} setter={(s) => {setFormSettings({...formSettings, grading_schema: s})}} refresh={loadGradingSchemas}></DropdownGroup>
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
          <div className='builder-properties-bottom row'>
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
                        <Users/>Lists
                      </h3>
                      <div className='hzSep'></div>
                      <div className='assignees-container'>
                        <MultiSelect
                          qid="assign-lists"
                          options={authorLists}
                          selectedIds={assigned.lists}
                          onOptionChange={onListAssignChange}
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
                          assigned.emails.map((email) => (
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
              <Send/>Publish
            </PrimaryButton>
            {
              isShareModalOpen && (
                <Modal title="Share form." close={setIsShareModalOpen}>
                  <div className='share-form-content'>
                    <span className='is-active-info'>Form is {(formSettings.is_active) ? 'active' : 'not active'}</span>
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
                    <p className='info-text'>Assigned Formly users can access this form from their dashboards.</p>
                    <div className='hzSep'></div>
                    {
                      !formSettings.is_active? (
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
            <ClipboardList/><h2>{formSettings.title}</h2>
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
                    <RefreshCcw ref={refreshIconRef}/>Refresh
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
                    <AnimatePresence key={componentData.componentId}>
                      <motion.div           
                        key={componentData.componentId}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className='form-component-builder-group'>
                        <DynamicComponentBuilder 
                          key={componentData.componentId} 
                          questionNo={qIndex + 1} 
                          formComponents={formComponents}
                          setFormComponents={setFormComponents}
                          locked
                          {...componentData}
                        ></DynamicComponentBuilder>
                      </motion.div>
                    </AnimatePresence>
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
  