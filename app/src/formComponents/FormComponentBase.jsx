import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import "./formComponents.css";


export function FormComponentBase({ questionNo, formComponents, setFormComponents, children, ...props }) {
  if (props.componentType === undefined) { throw new Error("Used FromComponentBase without specifying 'componentType'. It makes component unexportable."); }
  if (props.componentId === undefined) { throw new Error("Used FromComponentBase without specifying 'componentId'. It makes component unexportable."); }
  const componentData = JSON.stringify(props);

  return (
    <div className="form-component" _componentdata={componentData}>
      <h3><span>{questionNo}.</span> {props.question}</h3>
      <div className='hzSepMid'></div>
      {children}
    </div>
  )
}

export function FormBuilderOptions({ componentId, formComponents, setFormComponents }) {
  function handleDeleteFormComponent() {
    const newComponents = formComponents.filter(c => c.componentId != componentId);
    setFormComponents(newComponents);
  }

  function moveComponent(direction) {
    const index = formComponents.findIndex(c => c.componentId === componentId);
  
    if (index === -1) return formComponents;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formComponents.length) return formComponents;
  
    const newFormComponents = [...formComponents];
    [newFormComponents[index], newFormComponents[newIndex]] = 
      [newFormComponents[newIndex], newFormComponents[index]];
  
    setFormComponents(newFormComponents);
  }


  return (
    <div className='form-component-builder-options'>
      <div className='row'>
        <ChevronUp onClick={() => {moveComponent("up")}}/>
        <ChevronDown onClick={() => {moveComponent("down")}}/>
      </div>
      <div className='row'>
        <Trash2 onClick={handleDeleteFormComponent}/>
      </div>
    </div>
  )
}

