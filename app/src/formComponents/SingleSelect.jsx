import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { SingleSelect } from '../ui/Select.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';


export function SignleSelectAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Question?");
  const [options, setOptions] = useState(props.options || ["Answer 1"]);
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
      <SignleSelectAnswer question={question} options={options} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></SignleSelectAnswer>
      <div className='form-component-builder-editor'>
        <FormBuilderOptions componentId={props.componentId} formComponents={formComponents} setFormComponents={setFormComponents}></FormBuilderOptions>
        <div className='hzSepMid'></div>
        <InputGroup>
          <InputLabel>Question</InputLabel>
          <LongInput ref={questionChangerRef} onChange={onQuestionChange} defaultValue={question}></LongInput>
        </InputGroup>
        <div className='hzSep'></div>
        {
          options.map((option, index) => (
            <InputGroup key={option}>
              <InputLabel>Option {index + 1}</InputLabel>
              <Input value={option}></Input>
            </InputGroup>
          ))
        }
        add option
      </div>
    </div>
  )
}

export function SignleSelectAnswer({formComponents, setFormComponents, ...props}) {
  //TODO: options props
  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} {...props}>
      <SingleSelect qid={props.componentId} options={props.options}></SingleSelect>
    </FormComponentBase>
  )
}
