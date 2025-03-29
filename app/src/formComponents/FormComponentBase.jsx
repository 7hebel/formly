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

  return (
    <div className='form-component-builder-options'>
      <div className='row'>
        <ChevronUp/>
        <ChevronDown/>
      </div>
      <div className='row'>
        <Trash2 onClick={handleDeleteFormComponent}/>
      </div>
    </div>
  )
}

