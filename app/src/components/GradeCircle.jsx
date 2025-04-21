import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useEffect, useRef, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';


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

  return (
    <div key={id + value + schemaGrade} id={id} ref={containerRef} style={{ width: "44px", minWidth: "44px", fontFamily: "var(--ui-font)", fontWeight: 600 }}>
      <CircularProgressbar
        value={value}
        text={text}
        strokeWidth={8}
        key={value+schemaGrade}
        styles={buildStyles({
          strokeLinecap: "butt",
          textColor: "var(--color-text)",
          pathColor: "var(--color-primary)",
          trailColor: "var(--color-bg-item)",
          textSize: "28px",
        })}
      />
    </div>
  );
}
