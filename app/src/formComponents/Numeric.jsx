import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';


export function NumericAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Question?");
  const [minRange, setMinRange] = useState(props.minrange || null);
  const [maxRange, setMaxRange] = useState(props.maxrange || null);
  const [points, setPoints] = useState(props.points || "");
  const [correct, setCorrect] = useState(props.correct || "");
  if (minRange == 0) setMinRange(null);
  if (maxRange == 0) setMaxRange(null);

  const minRangeChangerRef = useRef(null);
  const maxRangeChangerRef = useRef(null);


  function changeQuestion(value) {
    setQuestion(value);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, question: value } : c
      )
    );
  }

  function changePoints(value) {
    setPoints(value);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, points: value } : c
      )
    );
  }

  function onCorrectChange(change) {
    setCorrect(change.target.value);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, correct: change.target.value } : c
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
        <FormBuilderOptions
          componentId={props.componentId}
          formComponents={formComponents}
          setFormComponents={setFormComponents}
          question={question}
          onQuestionChange={changeQuestion}
          points={points}
          onPointsChange={changePoints}
        ></FormBuilderOptions>
        <div className='hzSep'></div>
        <InputGroup>
          <InputLabel>Correct answer</InputLabel>
          <Input type="number" onChange={onCorrectChange} placeholder="Used for auto grading. Hidden from respondent." value={correct}></Input>
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

export function NumericAnswer({formComponents, setFormComponents, userAnswer, locked, ...props}) {
  const [answer, setAnswer] = useState(userAnswer);
  
  function reportValidAnswer(change) {
    if (change.target.value && change.target.validity.valid) {
      setAnswer(change.target.value);
    } else {
      setAnswer(null);
    }
  }

  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} userAnswer={answer} {...props}>
      <InputGroup>
        <InputLabel>Your numeric answer</InputLabel>
        <Input onChange={reportValidAnswer} type="number" min={props.minrange} max={props.maxrange} locked={locked} value={userAnswer}></Input>
      </InputGroup>
    </FormComponentBase>
  )
}
