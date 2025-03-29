import { useRef } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export function TrueFalse({ qid, defValueState, setter }) {
  const trueRef = useRef(null);
  const falseRef = useRef(null);
  
  function onTrue() {
    trueRef.current.checked = true;
    falseRef.current.checked = false;
    if (setter) setter(true);
  }
  
  function onFalse() {
    falseRef.current.checked = true;
    trueRef.current.checked = false;
    if (setter) setter(false);
  }
  
  return (
    <div className="truefalse-container">
      <div className="truefalse-inputs">
        <label className="truefalse-radio">
          <input type="radio" name={'tf-' + qid} id={'tf-' + qid + "-1"} ref={trueRef} onClick={onTrue} defaultChecked={defValueState===true}/>
          <span className="truefalse-name">
            <CheckCircle2/>
            True
          </span>
        </label>
        <label className="truefalse-radio">
          <input type="radio" name={'tf-' + qid} id={'tf-' + qid + "-0"} ref={falseRef} onClick={onFalse} defaultChecked={defValueState===false}/>
          <span className="truefalse-name">
            <XCircle/>
            False
          </span>
        </label>
      </div>
    </div>
  )
}
