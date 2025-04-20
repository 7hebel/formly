import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useEffect, useRef, useState } from 'react';

export function GradeCircle({ id, initialValue = 0 }) {
  const [value, setValue] = useState(parseInt(initialValue));
  const containerRef = useRef(null);

  useEffect(() => {
    if (!window.setGradeValue) window.setGradeValue = {};
    window.setGradeValue[id] = (newVal) => {
      setValue(parseInt(newVal));
    };

    return () => {
      delete window.setGradeValue[id];
    };
  }, [id]);

  return (
    <div id={id} ref={containerRef} style={{ width: "44px" }}>
      <CircularProgressbar
        value={value}
        text={`${value}%`}
        strokeWidth={6}
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
