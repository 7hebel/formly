import { DangerButton, PrimaryButton } from '../ui/Button.jsx';
import { getAnswerComponentBuilder } from "../formComponents/AllComponents.jsx";
import { ResponseGradePanel } from "../formComponents/FormComponentBase.jsx";
import { Medal, Trash2 } from 'lucide-react';
import { displayInfoMessage, displayWarnMessage } from '../components/Toasts.jsx'


function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yy} - ${hh}:${min}`;
}

function getTimeDifference(startTimestmap, endTimestamp) {
  const start = new Date(startTimestmap * 1000);
  const end = new Date(endTimestamp * 1000);
  let diffMs = Math.abs(end.getTime() - start.getTime());

  let hours = Math.floor(diffMs / (1000 * 60 * 60));
  let minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}


export function FormResponse({formId, responseData, formComponents, onRemoved, withGradePanel}) {   
  function getComponentById(componentId) {
    for (let componentData of formComponents) {
      if (componentData.componentId == componentId) return componentData
    }
  }

  async function removeResponse(responseId) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        form_id: formId,
        response_id: responseId
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/delete-response", requestOptions);
    const data = await response.json();
    
    if (data.status) {
      displayInfoMessage("Removed response.");
      if (onRemoved) onRemoved(null);
    } 
    else { displayWarnMessage(data.err_msg); }
  }

  async function gradeResponse(responseId) {
    const gradeInputs = document.querySelectorAll(`input[group="response-grade"]`);
    const grades = {};

    for (let gradeInput of gradeInputs) {
      const componentId = gradeInput.id;
      const grade = Math.max(parseInt(gradeInput.value), 0) ?? 0;
      grades[componentId] = grade;
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: String(localStorage.getItem("uuid")),
        form_id: formId,
        response_id: responseId,
        grades: grades
      }),
    };

    const response = await fetch(import.meta.env.VITE_API_URL + "/forms/grade-response", requestOptions);
    const data = await response.json();
    
    if (data.status) {
      displayInfoMessage(`Graded response: ${data.data}`);
      document.getElementById("resp-grade-" + responseId).textContent = data.data;
    } 
    else { displayWarnMessage(data.data); }
  }

  return (
    <div className='response-details'>
      <div className='response-details-meta'>
        <div className='response-meta-left'>
        <span className='response-meta'>
            Full name:
            <span className='response-meta-value'>{responseData.fullname}</span>
        </span>
        <span className='response-meta'>
            Email:
            <span className='response-meta-value'>{responseData.email}</span>
        </span>
        <span className='response-meta'>
            Started:
            <span className='response-meta-value'>{formatTime(responseData.started_at)}</span>
        </span>
        <span className='response-meta'>
            Submitted:
            <span className='response-meta-value'>{formatTime(responseData.finished_at)}</span>
        </span>
        <span className='response-meta'>
            Total time:
            <span className='response-meta-value'>{getTimeDifference(responseData.started_at, responseData.finished_at)}</span>
        </span>
        </div>
        <div className='response-details-actions'>
        {
          (onRemoved) ? (
            <DangerButton onClick={() => {removeResponse(responseData.response_id)}}>
              <Trash2/>Delete
            </DangerButton>
          ) : (<></>)
        }
        </div>
      </div>
      <div className='hzSepMid'></div>
      <div className='response-asnwers-container' key={JSON.stringify(responseData.answers)}>
        {
          Object.entries(responseData.answers).map(([componentId, {answer, grade}], qIndex) => {
            const componentData = getComponentById(componentId);

            const DynamicComponentBuilder = getAnswerComponentBuilder(componentData.componentType)  ;
            return (
              <div className='form-answer-with-grade' key={componentId}>
                <DynamicComponentBuilder 
                  key={componentData.componentId} 
                  questionNo={qIndex + 1}
                  userAnswer={answer}
                  locked
                  {...componentData}
                ></DynamicComponentBuilder>
                {
                  withGradePanel? (
                    <ResponseGradePanel componentId={componentId} currentGrade={grade}></ResponseGradePanel>
                  ) : <></>
                }
              </div>
            )
          })
        }
        {
          withGradePanel? (
            <PrimaryButton onClick={() => {gradeResponse(responseData.response_id)}}><Medal/>Grade response</PrimaryButton>
          ) : <></>
        }
      </div>
    </div>
  )
}
