import { InputGroup, InputLabel, Input, LongInput } from '../ui/Input.jsx';
import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import './formComponents.css';


export function ParagraphBlockBuilder({formComponents, setFormComponents, ...props}) {
  const [content, setContent] = useState(props.content || "");

  props.points = 0;
  props.questionNo = null;

  function changeContent(value) {
    setContent(value);
    setFormComponents(prevComponents =>
      prevComponents.map(c =>
        c.componentId === props.componentId ? { ...c, content: value } : c
      )
    );
  }

  return (
    <div className='form-component-builder-group'>
      <ParagraphBlock content={content} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></ParagraphBlock>
      <div className='form-component-builder-editor'>
        <FormBuilderOptions
          componentId={props.componentId}
          formComponents={formComponents}
          setFormComponents={setFormComponents}
          noPointsInput={true}
          noQuestionInput={true}
          noOptionalInput={true}
        ></FormBuilderOptions>
        <div className='hzSep'></div>
          <InputGroup>
            <InputLabel>Paragraph content</InputLabel>
            <LongInput onChange={(c) => {changeContent(c.target.value)}} placeholder="..." defaultValue={content}></LongInput>
          </InputGroup>
      </div>
    </div>
  )
}

export function ParagraphBlock({formComponents, setFormComponents, ...props}) {
  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} {...props}>
      <p className='paragraph-block'>{props.content}</p>
    </FormComponentBase>
  )
}

