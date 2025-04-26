import ReactSlider from 'react-slider'
import './gradingSchema.css'
import { useState } from 'react'
import { Plus, MinusSquare, Trash2, PenLine, Save, CheckCheck, Edit3 } from 'lucide-react'
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton } from '../ui/Button.jsx' 
import { InputGroup, Input, InputLabel } from '../ui/Input'
import { Modal } from '../ui/Modal.jsx'
import { useEffect } from 'react'
import { displayInfoMessage, displayWarnMessage } from '../components/Toasts.jsx'


export function SchemaEditor({ schema, onRefresh, noSave }) {
  const [stepsValue, setStepsValue] = useState([0, ...schema.steps]);
  const [gradesValue, setGradesValue] = useState(schema.grades);

  function handleRemoveStep(index) {
    const newSteps = [...stepsValue];
    newSteps.splice(index, 1);
  
    const newGrades = [...gradesValue];
    newGrades.splice(index, 1);
  
    if (newSteps.length <= 1) {
      setStepsValue([0]);
      setGradesValue([]);
    } else {
      setStepsValue(newSteps);
      setGradesValue(newGrades);
    }
  }

  function handleInsertStepBetween(index) {
    const from = stepsValue[index];
    const to = stepsValue[index + 1] ?? 100;
    const middle = Math.floor((from + to) / 2);
  
    if (middle === from || middle === to) return;
  
    const newSteps = [...stepsValue];
    newSteps.splice(index + 1, 0, middle);
    setStepsValue(newSteps);
  
    const newGrades = [...gradesValue];
    newGrades.splice(index + 1, 0, '');
    setGradesValue(newGrades);
  }

  async function onSchemaUpdate() {
    const clearSteps = [...stepsValue];
    if (clearSteps.length > 0) clearSteps.splice(0, 1);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        schema_id: schema.schema_id,
        steps: clearSteps,
        grades: gradesValue,
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/grading-schemas/edit", requestOptions);
    const data = await response.json();
    
    if (data.status) {
      onRefresh();
      displayInfoMessage("Schema saved");
    } else {
      displayWarnMessage(data.err_msg);
    }
  }

  function changeGrade(change, index) {
    const newGrades = [...gradesValue];
    newGrades[index] = change.target.value;
    setGradesValue(newGrades);
  }

  return (
    <div className='schema-editor'>
      <div className='schema-editor-range-container'>
        <span>0%</span>
        {
          stepsValue.length > 1 ? (
            <ReactSlider
              className="custom-slider"
              thumbClassName="custom-thumb"
              trackClassName="custom-track"
              value={stepsValue.slice(1)}
              min={1}
              max={99}
              step={1}
              minDistance={1}
              onChange={(values) => {(Array.isArray(values)) ? setStepsValue([0, ...values]) : setStepsValue([0, values])}}
              renderThumb={(props, state) => (
                <div {...props} key={props.key}>
                  <div className="thumb-label">{state.valueNow}%</div>
                </div>
              )}
            />
          ) : <div className='blank-slider'></div>
        }
        <span>100%</span>
      </div>
      <div className='hzSep'></div>
      <div className='schema-grades-container'>
        {
          stepsValue.map((step, index) => {
            let toStep = stepsValue[index + 1] ?? 100;

            return (
              <div key={step + index}>
                <div className='grade-edit'>
                  <span className='grade-range'>{step} - {toStep}%</span>
                  <div className='grade-line'></div>
                  <Input groupName="grading-schema-grade-input" onChange={(c) => {changeGrade(c, index)}} minlen={1} maxlen={3} value={gradesValue[index]} placeholder={index + 1}></Input>
                  { (stepsValue.length > 1) && <MinusSquare onClick={() => {handleRemoveStep(index)}}/> }
                  
                </div>
                {
                  (index < stepsValue.length - 1) ? (
                    <div className='grade-edit-insert-between-place-container'>
                      <div className='grade-edit-insert-between' onClick={() => handleInsertStepBetween(index)}>
                        <Plus/>
                        <div className='insert-between-line'></div>
                      </div>
                    </div>
                  ) : null
                }
              </div>
            )
          })
        }
        {
          gradesValue.length == 0 ? <SecondaryButton onClick={() => handleInsertStepBetween(0)}><Plus/>Add step</SecondaryButton> : null
        }
      </div>
      <div className='right-content'>
        {
          !noSave && <PrimaryButton onClick={onSchemaUpdate}><CheckCheck/>Save</PrimaryButton>
        }
      </div>
    </div>
  )

}

export function GradingSchemasManager() {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [schemas, setSchemas] = useState({});
  const [currentSchema, setCurrentSchema] = useState(null);

  useEffect(() => {loadSchemas()}, []);

  async function loadSchemas() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/grading-schemas/fetch", requestOptions);
    const data = await response.json();
    
    if (data.status) {
      setSchemas(data.data);

      let currentExists = Object.keys(data.data).includes(currentSchema?.schema_id);
      if ((!currentExists || !currentSchema) && Object.values(data.data).length > 0) {
        setCurrentSchema(Object.values(data.data)[Object.values(data.data).length - 1]);
      } else {
        setCurrentSchema(null);
      }
    } else {
      displayWarnMessage(data.err_msg);
    }
  }

  async function onSchemaCreate() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/grading-schemas/create", requestOptions);
    const data = await response.json();
    
    if (data.status) {
      await loadSchemas();
      setCurrentSchema(data.data)
    } else {
      displayWarnMessage(data.err_msg);
    }
  }

  async function onSchemaRemove() {
    if (!currentSchema) return;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        schema_id: currentSchema.schema_id
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/grading-schemas/remove", requestOptions);
    const data = await response.json();
    
    if (data.status) {
      await loadSchemas();
    } else {
      displayWarnMessage(data.err_msg);
    }
  }

  async function onSchemaRename() {
    if (!currentSchema) return;
    const newTitle = document.getElementById("new-schema-title");
    if (!newTitle.value || !newTitle.validity.valid) { return; };
    
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        schema_id: currentSchema.schema_id,
        new_title: newTitle.value
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/grading-schemas/rename", requestOptions);
    const data = await response.json();
    
    if (data.status) {
      await loadSchemas();
    } else {
      displayWarnMessage(data.err_msg);
    }
  }

  return (
    <div className='schemas-editor-content'>
      <div className='schemas-editor-header'>
        <div className='row'>
          <select
            className="text-select-dropdown"
            value={currentSchema?.schema_id ?? ""}
            onChange={(e) => {
              const selectedSchema = Object.values(schemas).find(
                schema => schema.schema_id == e.target.value
              );
              setCurrentSchema(selectedSchema);
            }}
          >
            {
              Object.values(schemas).map(schema => (
                <option key={schema.schema_id} value={schema.schema_id}>
                  {schema.title}
                </option>
              ))
            }
          </select>
          <PrimaryButton small onClick={onSchemaCreate}><Plus/>Create</PrimaryButton>
        </div>

      </div>
      <div className='hzSep'></div>
      <div className='row right-content'>
        {
          currentSchema && (
            <>
              <TertiaryButton small onClick={() => {setIsRenameOpen(true)}}><PenLine/>Rename</TertiaryButton>
              {
                isRenameOpen && (
                  <Modal title="Rename schema" close={setIsRenameOpen}>
                    <InputGroup>
                      <InputLabel>New schema title</InputLabel>
                      <Input type="text" id="new-schema-title" placeholder={currentSchema.title} minlen={3}></Input>
                    </InputGroup>
                    <PrimaryButton wide onClick={() => {onSchemaRename(); setIsRenameOpen(false)}}><Edit3/>Rename</PrimaryButton>
                  </Modal>
                )
              }
    
              <DangerButton small onClick={() => {setIsDeleteOpen(true)}}><Trash2/>Delete</DangerButton>
              {
                isDeleteOpen && (
                  <Modal title="Remove schema?" close={setIsDeleteOpen}>
                    <p className='info-text'>Schema <b>{currentSchema.title}</b> will be irreversibly deleted. <br></br>Forms with this schema will remain.</p>
                    <div className='row wide'>
                      <TertiaryButton wide onClick={() => {setIsDeleteOpen(false)}}>Cancel</TertiaryButton>
                      <DangerButton wide onClick={() => {onSchemaRemove(); setIsDeleteOpen(false)}}>Delete</DangerButton>
                    </div>
                  </Modal>
                )
              }
            </>
          )
        }
      </div>
      {
        currentSchema? (
          <div key={currentSchema.schema_id}>
            <SchemaEditor schema={currentSchema} onRefresh={loadSchemas}></SchemaEditor>
          </div>
        ) : (
          <p className='info-text'>Select schema to modify it or create new. Use grading schemas to automatically assign grades.</p>
        )
      }
    </div>
  )

}

