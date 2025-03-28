import { useRef } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export function TrueFalse({ qid }) {
  const trueRef = useRef(null);
  const falseRef = useRef(null);
  
  function onTrue() {
    trueRef.current.checked = true;
    falseRef.current.checked = false;
  }
  
  function onFalse() {
    falseRef.current.checked = true;
    trueRef.current.checked = false;
  }
  
  return (
    <div className="truefalse-container">
      <div className="truefalse-inputs">
        <label className="truefalse-radio">
          <input type="radio" name={'tf-' + qid} ref={trueRef} onClick={onTrue}/>
          <span className="truefalse-name">
            <CheckCircle2/>
            True
          </span>
        </label>
        <label className="truefalse-radio">
          <input type="radio" name={'tf-' + qid} ref={falseRef} onClick={onFalse}/>
          <span className="truefalse-name">
            <XCircle/>
            False
          </span>
        </label>
      </div>
    </div>
  )
}
