import { useRef } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export function TrueFalse({ qid, defValueState, setter, locked, isDimmed, onChange }) {
  const trueRef = useRef(null);
  const falseRef = useRef(null);
  
  function onTrue() {
    trueRef.current.checked = true;
    falseRef.current.checked = false;
    if (setter) setter(true);
    if (onChange) onChange();
  }
  
  function onFalse() {
    falseRef.current.checked = true;
    trueRef.current.checked = false;
    if (setter) setter(false);
    if (onChange) onChange();
  }

  
  return (
    <div className="truefalse-container">
      <div className="truefalse-inputs">
        <label className={"truefalse-radio " + (isDimmed ? 'dimmed-truefalse' : '')}>
          <input type="radio" name={'tf-' + qid} id={'tf-' + qid + "-1"} ref={trueRef} onClick={onTrue} defaultChecked={defValueState===true} disabled={locked}/>
          <span className="truefalse-name">
            <CheckCircle2/>
            True
          </span>
        </label>
        <label className={"truefalse-radio " + (isDimmed ? 'dimmed-truefalse' : '')}>
          <input type="radio" name={'tf-' + qid} id={'tf-' + qid + "-0"} ref={falseRef} onClick={onFalse} defaultChecked={defValueState===false} disabled={locked}/>
          <span className="truefalse-name">
            <XCircle/>
            False
          </span>
        </label>
      </div>
    </div>
  )
}
