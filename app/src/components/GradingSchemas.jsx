import ReactSlider from 'react-slider'
import { Input } from '../ui/Input'
import './gradingSchema.css'
import { useState } from 'react'
import { Plus, MinusSquare, Trash2, PenLine, Save, CheckCheck } from 'lucide-react'
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton } from '../ui/Button.jsx' 
import { Modal } from '../ui/Modal.jsx'


function SchemaEditor({ steps, grades }) {
  const [stepsValue, setStepsValue] = useState([0, ...steps]);
  const [gradesValue, setGradesValue] = useState(grades);

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
                  <Input groupName="grading-schema-grade-input" minlen={1} maxlen={3} value={gradesValue[index]} placeholder={index + 1}></Input>
                  { (stepsValue.length > 1) ? <MinusSquare onClick={() => {handleRemoveStep(index)}}/> : <></> }
                  
                </div>
                {
                  (index < stepsValue.length - 1) ? (
                    <div className='grade-edit-insert-between-place-container'>
                      <div className='grade-edit-insert-between' onClick={() => handleInsertStepBetween(index)}>
                        <Plus/>
                        <div className='insert-between-line'></div>
                      </div>
                    </div>
                  ) : <></>
                }
              </div>
            )
          })
        }
        {
          gradesValue.length == 0 ? <PrimaryButton onClick={() => handleInsertStepBetween(0)}><Plus/>Add step</PrimaryButton> : null
        }
      </div>
    </div>
  )

}

export function GradingSchemasManager() {
  // TODO load schemas using api by localstorage.uuid
  const schemas = [
    {
      title: 'Schema 1',
      steps: [40, 52, 70, 84, 95],
      grades: [1, 2, 3, 4, 5, 6]
      // steps: [],
      // grades: [],
    }
  ]

  return (
    <div className='schemas-editor-content'>
      <div className='schemas-editor-header'>
        
        <div className='row'>
          <select className='text-select-dropdown'>
            <option>Schema 1</option>
            <option>Schema 2</option>
            <option>Schema 3</option>
          </select>
          <PrimaryButton small><Plus/>Create</PrimaryButton>
        </div>


        <div className='row'>
          <DangerButton small><Trash2/>Delete</DangerButton>
          <TertiaryButton small><PenLine/>Rename</TertiaryButton>
        </div>
      </div>
      <div className='hzSepMid'></div>
      <SchemaEditor grades={schemas[0].grades} steps={schemas[0].steps}></SchemaEditor>
      <div className='right-content'>
        <PrimaryButton><CheckCheck/>Save</PrimaryButton>
      </div>
    </div>
  )

}

