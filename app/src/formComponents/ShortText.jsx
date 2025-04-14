import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import InfoAI from '../components/InfoAI.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';


export function ShortTextAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Question?");
  const [points, setPoints] = useState(props.points);
  const [correct, setCorrect] = useState(props.correct ?? '');

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

  function changeCorrect(change) {
    setCorrect(change.target.value);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, correct: change.target.value } : c
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
        <div className='hzSep'></div>
          <InputGroup>
            <InputLabel>Correct answer</InputLabel>
            <Input onChange={changeCorrect} placeholder="Used for auto grading. Hidden from respondent." value={correct}></Input>
          </InputGroup>
          <InfoAI>Response will be compared <b>using AI</b>. Text shoud be short and concise.</InfoAI>
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

