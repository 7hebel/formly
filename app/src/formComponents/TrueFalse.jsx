import { TrueFalse } from '../ui/TrueFalse.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';
import { InputGroup, InputLabel } from '../ui/Input.jsx';


export function TrueFalseAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Question?");
  const [correct, setCorrect] = useState(props.correct || null);
  props.points = 1;

  function changeQuestion(value) {
    setQuestion(value);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, question: value } : c
      )
    );
  }

  function changeCorrect(value) {
    setCorrect(value);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, correct: value } : c
      )
    );
  }

  return (
    <div className='form-component-builder-group'>
      <TrueFalseAnswer question={question} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></TrueFalseAnswer>
      <div className='form-component-builder-editor'>
        <FormBuilderOptions
          componentId={props.componentId}
          formComponents={formComponents}
          setFormComponents={setFormComponents}
          question={question}
          onQuestionChange={changeQuestion}
          points={1}
          noPointsInput={true}
        ></FormBuilderOptions>
        <div className='hzSep'></div>
        <InputLabel>Correct answer</InputLabel>
        <TrueFalse qid={'correct-'+props.componentId} setter={changeCorrect} defValueState={correct}></TrueFalse>
      </div>
    </div>
  )
}

export function TrueFalseAnswer({formComponents, setFormComponents, userAnswer, locked, ...props}) {
  const [answer, setAnswer] = useState(userAnswer);
  let value = null;
  if (userAnswer !== undefined) value = (userAnswer == 1)

  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} userAnswer={answer} {...props}>
      <TrueFalse setter={(v) => {setAnswer(Number(v))}} qid={props.componentId} locked={locked} defValueState={value}></TrueFalse>
    </FormComponentBase>
  )
}
