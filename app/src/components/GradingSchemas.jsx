import ReactSlider from 'react-slider'
import { Input } from '../ui/Input'
import './gradingSchema.css'
import { useState } from 'react'



function SchemaEditor({ title, steps, grades }) {
  const [stepsValue, setStepsValue] = useState(steps);
  const gradeSteps = [0, ...stepsValue];
  
  return (
    <div className='schema-editor'>
      <p className='schema-title'>{title}</p>
      <div className='schema-editor-range-container'>
        <span>0%</span>
        <ReactSlider
          className="custom-slider"
          thumbClassName="custom-thumb"
          trackClassName="custom-track"
          defaultValue={steps}
          min={1}
          max={99}
          step={1}
          minDistance={1}
          onChange={(values) => setStepsValue(values)}
          renderThumb={(props, state) => (
            <div {...props} key={props.key}>
              <div className="thumb-label">{state.valueNow}%</div>
            </div>
          )}
        />
        <span>100%</span>
      </div>
      <div className='hzSep'></div>
      <div className='schema-grades-container'>
        {
          gradeSteps.map((step, index) => {
            let toStep = gradeSteps[index + 1] ?? 100;

            return (
              <div className='grade-edit'>
                <span className='grade-range'>{step} - {toStep}</span>
                <div className='grade-line'></div>
                <Input groupName="grading-schema-grade-input" minlen={1} maxlen={3} value={grades[index]} placeholder={index + 1}></Input>
              </div>
            )
            
          })
        }
      </div>
    </div>
  )

}

export function GradingSchemasManager() {
  // TODO load schemas using api with localstorage.uuid
  const schemas = [
    {
      title: 'Schema 1',
      steps: [40, 52, 70, 84, 95],
      grades: [1, 2, 3, 4, 5, 6]
    }
  ]

  return <SchemaEditor title={schemas[0].title} grades={schemas[0].grades} steps={schemas[0].steps}></SchemaEditor>

}

