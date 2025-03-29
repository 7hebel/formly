import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';


export function ShortTextAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Short text question...");
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
      <ShortTextAnswer question={question} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></ShortTextAnswer>
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

export function ShortTextAnswer({formComponents, setFormComponents, ...props}) {
  return (
    <FormComponentBase componentType="short-text-answer" formComponents={formComponents} setFormComponents={setFormComponents} {...props}>
      <InputGroup>
        <InputLabel>Your short answer</InputLabel>
        <Input placeholder="Maximum 80 characters..." maxlen={80}></Input>
      </InputGroup>
    </FormComponentBase>
  )
}

