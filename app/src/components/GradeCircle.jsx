import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useEffect, useRef, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { Tooltip } from "react-tooltip";


export function GradeCircle({ id, initialValue = 0, schemaGrade }) {
  const [value, setValue] = useState(parseInt(initialValue));
  const [text, setText] = useState((schemaGrade) ? schemaGrade : value + "%");
  const containerRef = useRef(null);

  useEffect(() => {
    if (!window.setGradeValue) window.setGradeValue = {};
    window.setGradeValue[id] = (gradeInfo) => {
      console.log(gradeInfo)
      setValue(parseInt(gradeInfo.percentage));
      setText(gradeInfo.schema);
    };

    return () => {
      delete window.setGradeValue[id];
    };
  }, [id]);

  useEffect(() => {
    setValue(value);
    if (schemaGrade) {
      setText(schemaGrade);
    } else {
      setText(value + "%");
    }
  }, [schemaGrade, value]);

  const itemKey = id + value + schemaGrade;
  return (
    <>
      <div data-tooltip-id={itemKey} key={itemKey} id={id} ref={containerRef} style={{ width: "44px", minWidth: "44px", fontFamily: "var(--ui-font)", fontWeight: 600 }}>
        <CircularProgressbar
          value={value}
          text={text}
          strokeWidth={8}
          key={itemKey}
          styles={buildStyles({
            strokeLinecap: "butt",
            textColor: "var(--color-text)",
            pathColor: "var(--color-primary)",
            trailColor: "var(--color-bg-item)",
            textSize: "28px",
          })}
        />
      </div>
      <Tooltip
        id={itemKey}
        content={value + "%"}
        style={{fontFamily: "var(--ui-font)", fontSize: "14px", fontWeight: 600, backgroundColor: "var(--color-text)"}}
      />
    </>
  );
}
