import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';


export function LongTextAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Question?");
  const [points, setPoints] = useState(props.points || "");

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

  return (
    <div className='form-component-builder-group'>
      <LongTextAnswer question={question} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></LongTextAnswer>
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
      </div>
    </div>
  )
}

export function LongTextAnswer({formComponents, setFormComponents, userAnswer, locked, ...props}) {
  const [answer, setAnswer] = useState(userAnswer);
  
  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} userAnswer={answer} {...props}>
      <InputGroup>
        <InputLabel>Your long answer</InputLabel>
        <LongInput onChange={(c) => {setAnswer(c.target.value)}} maxlen={5000} locked={locked} defaultValue={userAnswer}></LongInput>
      </InputGroup>
    </FormComponentBase>
  )
}

