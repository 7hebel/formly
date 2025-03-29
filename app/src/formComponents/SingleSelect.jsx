import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { SingleSelect } from '../ui/Select.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';


export function SignleSelectAnswerBuilder({formComponents, setFormComponents, ...props}) {
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
      <SignleSelectAnswer question={question} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></SignleSelectAnswer>
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

export function SignleSelectAnswer({formComponents, setFormComponents, ...props}) {
  //TODO: options props
  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} {...props}>
        <SingleSelect qid={props.componentId}></SingleSelect>
    </FormComponentBase>
  )
}
