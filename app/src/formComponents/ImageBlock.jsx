import { FormComponentBase, FormBuilderOptions } from './FormComponentBase.jsx';
import { useRef, useState } from 'react';
import { displayWarnMessage } from '../components/Toasts.jsx';
import { TertiaryButton } from '../ui/Button.jsx';
import { ImageIcon } from 'lucide-react';
import './formComponents.css';


export function ImageBlockBuilder({formComponents, setFormComponents, ...props}) {
  const [sourceHash, setSourceHash] = useState(props.sourceHash);
  const imgInputRef = useRef(null);

  props.questionNo = null;
  props.points = 0;

  async function onImageChange() {
    const uploadedFile = imgInputRef.current.files[0];

    const formData = new FormData();
    formData.append("uuid", localStorage.getItem("uuid"));
    formData.append("file", uploadedFile);
  
    const response = await fetch(import.meta.env.VITE_API_URL + "/cdn/upload", {
      method: "POST",
      body: formData,
    });
  
    const data = await response.json();
    if (data.status) {
      setSourceHash(data.data);
      setFormComponents(prevComponents =>
        prevComponents.map(c =>
          c.componentId === props.componentId ? { ...c, sourceHash: data.data } : c
        )
      );
    } else {
      displayWarnMessage(data.err_msg);
    }
  }

  return (
    <div className='form-component-builder-group'>
      <ImageBlock sourceHash={sourceHash} formComponents={formComponents} setFormComponents={setFormComponents} {...props}></ImageBlock>
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
          <TertiaryButton onClick={() => {imgInputRef.current.click();}}>
            <ImageIcon/>Change image
          </TertiaryButton>
          <input style={{display: "none"}} type='file' ref={imgInputRef} onChange={onImageChange}></input>
      </div>
    </div>
  )
}

export function ImageBlock({formComponents, setFormComponents, ...props}) {
  return (
    <FormComponentBase formComponents={formComponents} setFormComponents={setFormComponents} points={0} {...props}>
      {
        (props.sourceHash) ? <img src={import.meta.env.VITE_API_URL + "/cdn/fetch/" + props.sourceHash} className='image-block'></img> : <p className='info-text'>(no image)</p>
      }
    </FormComponentBase>
  )
}

