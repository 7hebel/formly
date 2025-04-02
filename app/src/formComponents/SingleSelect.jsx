import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { SingleSelect } from '../ui/Select.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import { PlusCircle, MinusCircle, CheckCircle } from 'lucide-react';
import './formComponents.css';
import { TertiaryButton } from '../ui/Button.jsx';


export function SingleSelectAnswerBuilder({formComponents, setFormComponents, ...props}) {
  const [question, setQuestion] = useState(props.question || "Question?");
  const [options, setOptions] = useState(props.options || [{id: crypto.randomUUID(), value: "Option 1"}]);
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

  function changePoints(value) {
    setPoints(value);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, points: value } : c
      )
    );
  }

  function changeCorrect(value) {
    if (value == correct) {
      document.getElementById(value).setAttribute("checked", "");
      value = "";
      setCorrect(value);
      setFormComponents(prevComponents =>
        prevComponents.map(c =>
          c.componentId === props.componentId ? { ...c, correct: value } : c
        )
      )
      return;
    }
    
    setCorrect(value);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, correct: value } : c
      )
    );
    document.querySelectorAll(`.form-builder-option-correct[name="${props.componentId}"]`).forEach(el => el.setAttribute("checked", ""));
    document.getElementById(value).setAttribute("checked", "1");
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
      <SignleSelectAnswer question={question} options={options} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></SignleSelectAnswer>
      <div className='form-component-builder-editor'>
        <FormBuilderOptions
          componentId={props.componentId}
          formComponents={formComponents}
          setFormComponents={setFormComponents}
          question={question}
          onQuestionChange={changeQuestion}
          points={1}
          onPointsChange={changePoints}
          noPointsInput={true}
        ></FormBuilderOptions>
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
                      )) 
                    }}
                  />
                  <CheckCircle className='form-builder-option-correct' id={option.id} name={props.componentId} onClick={() => {changeCorrect(option.id)}} checked={Number(option.id == correct)}/>
                  <MinusCircle className='form-builder-option-delete' onClick={() => {
                    const newOptions = options.filter(opt => opt.id !== option.id);
                    setOptions(newOptions);
                    setFormComponents(prevComponents =>
                      prevComponents.map(c =>
                        c.componentId === props.componentId ? { ...c, options: newOptions } : c
                    )) 
                  }}/>
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

export function SignleSelectAnswer({formComponents, setFormComponents, userAnswer, locked, ...props}) {
  const [answer, setAnswer] = useState(userAnswer);
  
  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} userAnswer={answer} {...props}>
      <SingleSelect qid={props.componentId} options={props.options} answerReporter={setAnswer} selectedId={userAnswer} locked={locked}></SingleSelect>
    </FormComponentBase>
  )
}
