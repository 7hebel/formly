import { useRef } from 'react';


export function SingleSelect({ qid, options }) {
  return (
    <div className="select-container">
      {
        options?.map((option, index) => (
          <label key={index} className='select-radio-label'>
            <input type="radio" name={'ssel-' + qid} className='select-radio'/>
            {option}
          </label>
        ))
      }
    </div>
  )
}

export function MultiSelect({ qid, onOptionChange, options, keys, states }) {
  if (keys !== undefined && options.length !== keys.length) {
    throw new Error("Created MultiSelect with keys array not matching options.");
  }
  if (states !== undefined && options.length !== states.length) {
    throw new Error("Created MultiSelect with states array not matching options.");
  }
  
  return (
    <div className="select-container">
      {
        options?.map((option, index) => (
          <label key={option + "" + index + (keys? keys[index] : "")} className='select-radio-label'>
            <input 
              type="checkbox"
              name={'msel-' + qid}
              optionkey={keys? keys[index] : null}
              className='select-radio multi-radio'
              onInput={onOptionChange}
              defaultChecked={states? states[index] : false}
            />
            {option}
          </label>
        ))
      }
    </div>
  )
}
