import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { TrueFalse } from '../ui/TrueFalse.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';


export function TrueFalseAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Question?");
  const questionChangerRef = useRef(null);

  function onQuestionChange() {
    let newQuestion = questionChangerRef.current.value;
    setQuestion(newQuestion);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, question: newQuestion } : c
      )
    );
  }

  return (
    <div className='form-component-builder-group'>
      <TrueFalseAnswer question={question} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></TrueFalseAnswer>
      <div className='form-component-builder-editor'>
        <FormBuilderOptions componentId={props.componentId} formComponents={formComponents} setFormComponents={setFormComponents}></FormBuilderOptions>
        <div className='hzSepMid'></div>
        <InputGroup>
          <InputLabel>Question</InputLabel>
          <LongInput ref={questionChangerRef} onChange={onQuestionChange} defaultValue={question}></LongInput>
        </InputGroup>
      </div>
    </div>
  )
}

export function TrueFalseAnswer({formComponents, setFormComponents, userAnswer, locked, ...props}) {
  const [answer, setAnswer] = useState(userAnswer);
  
  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} userAnswer={answer} {...props}>
      <TrueFalse setter={(v) => {setAnswer(Number(v))}} qid={props.componentId} locked={locked} defValueState={Boolean(userAnswer)}></TrueFalse>
    </FormComponentBase>
  )
}
