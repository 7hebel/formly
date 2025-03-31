import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { SingleSelect } from '../ui/Select.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import './formComponents.css';
import { TertiaryButton } from '../ui/Button.jsx';


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

  function onOptionContentChange(index, value) {
    const newOptions = [...options]; 
    newOptions[index] = value; 
    setOptions(newOptions);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, options: newOptions } : c
      )
    );
  }

  function onAddOption() {
    const newOptions = [...options, `Answer ${options.length + 1}`]
    setOptions(newOptions);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, options: newOptions } : c
      )
    );
  }

  function onOptionDelete(index) {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, options: newOptions } : c
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
        <div className='form-builder-options-container'>
          {
            options.map((option, index) => (
              <InputGroup key={index}>
                <InputLabel>Option {index + 1}</InputLabel>
                <div className='input-with-action'>
                  <Input value={option} onChange={(ev) => {onOptionContentChange(index, ev.target.value)}}></Input>
                  <MinusCircle className='form-builder-option-delete' onClick={() => {onOptionDelete(index)}}/>
                </div>
              </InputGroup>
            ))
          }
        </div>
        <div className='hzSep'></div>
        <TertiaryButton onClick={onAddOption}>
          <PlusCircle/>Add option
        </TertiaryButton>
      </div>
    </div>
  )
}

export function SignleSelectAnswer({formComponents, setFormComponents, ...props}) {
  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} {...props}>
      <SingleSelect qid={props.componentId} options={props.options}></SingleSelect>
    </FormComponentBase>
  )
}
