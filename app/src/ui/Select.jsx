import { useState } from 'react';


export function SingleSelect({ qid, options, answerReporter, selectedId, locked }) {
  function handleAnswerChange(c) {
    const selected = document.querySelector(`input[name='ssel-${qid}']:checked`).getAttribute("optionkey");
    if (answerReporter) answerReporter(selected);
  }

  return (
    <div className="select-container">
      {
        options?.map((option) => (
          <label key={option.id} className='select-radio-label'>
            <input 
              type="radio"
              name={'ssel-' + qid}
              optionkey={option.id}
              onInput={handleAnswerChange}
              className='select-radio'
              disabled={locked}
              defaultChecked={selectedId === option.id}
            />
            {option.value}
          </label>
        ))
      }
    </div>
  )
}

export function MultiSelect({ qid, onOptionChange, options, answersReporter, selectedIds, locked }) {
  const [localAnswers, setLocalAnswers] = useState([]);
  function handleAnswerChange(c) {
    const checkbox = c.target;
    let newAnswers = localAnswers;

    if (checkbox.checked) {
      newAnswers = [...localAnswers, checkbox.getAttribute("optionkey")];
    } else {
      newAnswers = localAnswers.filter(a => a != checkbox.getAttribute("optionkey"));
    }
    
    setLocalAnswers(newAnswers);
    if (answersReporter) answersReporter(newAnswers);
  }

  return (
    <div className="select-container">
      {
        options?.map((option) => (
          <label key={option.id} className='select-radio-label'>
            <input 
              type="checkbox"
              name={'msel-' + qid}
              optionkey={option.id}
              className='select-radio multi-radio'
              onInput={(c) => {handleAnswerChange(c); if (onOptionChange) onOptionChange(c)}}
              defaultChecked={selectedIds?.includes(option.id)}
              disabled={locked}
            />
            {option.value}
          </label>
        ))
      }
    </div>
  )
}
