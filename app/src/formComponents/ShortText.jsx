import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';


export function ShortTextAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Question?");
  const [points, setPoints] = useState(props.points ?? 1);

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
      <ShortTextAnswer question={question} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></ShortTextAnswer>
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

export function ShortTextAnswer({formComponents, setFormComponents, userAnswer, locked, ...props}) {
  const [answer, setAnswer] = useState(userAnswer);

  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} userAnswer={answer} {...props}>
      <InputGroup>
        <InputLabel>Your short answer</InputLabel>
        <Input onChange={(c) => {setAnswer(c.target.value)}} value={userAnswer} placeholder="Maximum 80 characters..." maxlen={80} locked={locked}></Input>
      </InputGroup>
    </FormComponentBase>
  )
}

