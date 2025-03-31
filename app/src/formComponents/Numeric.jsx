import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';


export function NumericAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Question?");
  const [minRange, setMinRange] = useState(props.minrange || null);
  const [maxRange, setMaxRange] = useState(props.maxrange || null);
  if (minRange == 0) setMinRange(null);
  if (maxRange == 0) setMaxRange(null);

  const questionChangerRef = useRef(null);
  const minRangeChangerRef = useRef(null);
  const maxRangeChangerRef = useRef(null);

  function onQuestionChange() {
    let newQuestion = questionChangerRef.current.value;
    setQuestion(newQuestion);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, question: newQuestion } : c
      )
    );
  }

  function onRangeChange() {
    let newMin = minRangeChangerRef.current.value;
    let newMax = maxRangeChangerRef.current.value;
    let isValid = true;

    if (newMin && newMax) {
      if (newMin > newMax) {
        minRangeChangerRef.current.setCustomValidity("Minimum greater than maximum");
        maxRangeChangerRef.current.setCustomValidity("Minimum greater than maximum");
        isValid = false;
      }
    }

    if (isValid) {
      minRangeChangerRef.current.setCustomValidity("");
      maxRangeChangerRef.current.setCustomValidity("");
    }

    minRangeChangerRef.current.reportValidity();
    maxRangeChangerRef.current.reportValidity();

    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, minrange: newMin, maxrange: newMax } : c
      )
    );
    setMinRange(newMin);
    setMaxRange(newMax);
  }

  return (
    <div className='form-component-builder-group'>
      <NumericAnswer question={question} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></NumericAnswer>
      <div className='form-component-builder-editor'>
        <FormBuilderOptions componentId={props.componentId} formComponents={formComponents} setFormComponents={setFormComponents}></FormBuilderOptions>
        <div className='hzSepMid'></div>
        <InputGroup>
          <InputLabel>Question</InputLabel>
          <LongInput ref={questionChangerRef} onChange={onQuestionChange} defaultValue={question}></LongInput>
        </InputGroup>
        <div className='hzSep'></div>
        <div className='row'>
          <InputGroup>
            <InputLabel>Minimum value</InputLabel>
            <Input type="number" ref={minRangeChangerRef} onChange={onRangeChange} placeholder={0} value={minRange}></Input>
          </InputGroup>
          <InputGroup>
            <InputLabel>Maximum value</InputLabel>
            <Input type="number" ref={maxRangeChangerRef} onChange={onRangeChange} placeholder={0} value={maxRange}></Input>
          </InputGroup>
        </div>
      </div>
    </div>
  )
}

export function NumericAnswer({formComponents, setFormComponents, ...props}) {
  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} {...props}>
      <InputGroup>
        <InputLabel>Your long answer</InputLabel>
        <Input type="number" min={props.minrange} max={props.maxrange}></Input>
      </InputGroup>
    </FormComponentBase>
  )
}
