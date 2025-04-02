import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input';
import "./formComponents.css";

export function FormComponentBase({ questionNo, formComponents, setFormComponents, userAnswer, children, ...props }) {
  if (props.componentType === undefined) { throw new Error("Used FromComponentBase without specifying 'componentType'. It makes component unexportable."); }
  if (props.componentId === undefined) { throw new Error("Used FromComponentBase without specifying 'componentId'. It makes component unexportable."); }
  const componentData = JSON.stringify(props);

  const pointsInfo = (props.points > 0) ? `${props.points} p.` : '';

  return (
    <div className="form-component" _componentid={props.componentId} _componentdata={componentData} _answer={userAnswer}>
      <h3><span>{questionNo}.</span> {props.question} <span className='points-info'>{pointsInfo}</span></h3>
      <div className='hzSepMid'></div>
      {children}
    </div>
  )
}

export function ResponseGradePanel({ componentId, currentGrade }) {
  return (
    <div className='form-component-grade-panel'>
      <InputGroup>
        <InputLabel>Grade answer</InputLabel>
        <div className='input-with-action'>
          <Input type='number' groupName="response-grade" id={componentId} value={currentGrade} min={0}></Input>
          <p className='input-unit'>p.</p>
        </div>
      </InputGroup>
    </div>
  )
}

export function FormBuilderOptions({ componentId, formComponents, setFormComponents, onQuestionChange, question, onPointsChange, points, noPointsInput }) {
  function handleDeleteFormComponent() {
    const newComponents = formComponents.filter(c => c.componentId != componentId);
    setFormComponents(newComponents);
  }

  function moveComponent(direction) {
    const index = formComponents.findIndex(c => c.componentId === componentId);
  
    if (index === -1) return formComponents;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formComponents.length) return formComponents;
  
    const newFormComponents = [...formComponents];
    [newFormComponents[index], newFormComponents[newIndex]] = 
      [newFormComponents[newIndex], newFormComponents[index]];
  
    setFormComponents(newFormComponents);
  }

  function updateQuestion(change) {
    onQuestionChange(change.target.value);
  }

  function updatePoints(change) {
    if (!change.target.value || change.target.value >= 0) {
      onPointsChange(change.target.value);
    }
  }

  return (
    <>
      <div className='form-component-builder-options'>
        <div className='row'>
          <ChevronUp onClick={() => {moveComponent("up")}}/>
          <ChevronDown onClick={() => {moveComponent("down")}}/>
        </div>
        <div className='row'>
          <Trash2 onClick={handleDeleteFormComponent}/>
        </div>
      </div>
      <div className='hzSepMid'></div>
      <InputGroup>
        <InputLabel>Question</InputLabel>
        <LongInput onChange={updateQuestion} defaultValue={question}></LongInput>
      </InputGroup>
      {
        !noPointsInput? (<>
          <div className='hzSep'></div>
          <InputGroup>
            <InputLabel>Points</InputLabel>
            <Input type='number' min={0} value={points} onChange={updatePoints}></Input>
          </InputGroup>
        </>
        ) : <></>
      }
    </>
  )
}

