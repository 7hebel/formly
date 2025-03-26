import { useRef } from 'react';


export function SingleSelect({ qid, options }) {
  const id = useRef(qid);
  
  return (
    <div className="select-container">
      {
        options.map(option => (
          <label key={option} className='select-radio-label'>
            <input type="radio" name={'ssel-' + id.current} className='select-radio'/>
            {option}
          </label>
        ))
      }
    </div>
  )
}

export function MultiSelect({ qid, options }) {
  const id = useRef(qid);
  
  return (
    <div className="select-container">
      {
        options.map(option => (
          <label key={option} className='select-radio-label'>
            <input type="checkbox" name={'msel-' + id.current} className='select-radio multi-radio'/>
            {option}
          </label>
        ))
      }
    </div>
  )
}
