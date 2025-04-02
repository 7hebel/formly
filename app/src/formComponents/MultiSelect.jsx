import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { MultiSelect } from '../ui/Select.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import { PlusSquare, MinusSquare } from 'lucide-react';
import './formComponents.css';
import { TertiaryButton } from '../ui/Button.jsx';


export function MultiSelectAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Question?");
  const [options, setOptions] = useState(props.options || [{id: crypto.randomUUID(), value: "Option 1"}]);
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

  function onAddOption() {
    const addedOption = {id: crypto.randomUUID(), value: `Option ${options.length + 1}`};
    const newOptions = [...options, addedOption];
    setOptions(newOptions);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, options: newOptions } : c
      )
    );
  }

  return (
    <div className='form-component-builder-group'>
      <MultiSelectAnswer question={question} options={options} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></MultiSelectAnswer>
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
              <InputGroup key={option.id}>
                <InputLabel>Option {index + 1}</InputLabel>
                <div className='input-with-action'>
                  <Input 
                    value={option.value} 
                    onChange={(ev) => {
                      const newOptions = options.map(opt =>
                        opt.id === option.id ? { ...opt, value: ev.target.value } : opt
                      );
                      setOptions(newOptions);
                      setFormComponents(prevComponents =>
                        prevComponents.map(c =>
                          c.componentId === props.componentId ? { ...c, options: newOptions } : c
                        )
                      );
                    }}
                  />
                  <MinusSquare className='form-builder-option-delete' onClick={() => {
                    const newOptions = options.filter(opt => opt.id !== option.id);
                    setOptions(newOptions);
                    setFormComponents(prevComponents =>
                      prevComponents.map(c =>
                        c.componentId === props.componentId ? { ...c, options: newOptions } : c
                      )
                    );
                  }}/>
                </div>
              </InputGroup>
            ))
          }
        </div>
        <div className='hzSep'></div>
        <TertiaryButton onClick={onAddOption}>
          <PlusSquare/>Add option
        </TertiaryButton>
      </div>
    </div>
  )
}

export function MultiSelectAnswer({formComponents, setFormComponents, userAnswer, locked, ...props}) {
  const [answers, setAnswers] = useState(userAnswer);
  
  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} userAnswer={answers} {...props}>
      <MultiSelect qid={props.componentId} answersReporter={setAnswers} options={props.options} locked={locked} selectedIds={userAnswer}></MultiSelect>
    </FormComponentBase>
  )
}
