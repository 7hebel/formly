import { useState } from "react";

export function Switch({ checked = false, onChange }) {
  const [isOn, setIsOn] = useState(checked);

  const toggle = () => {
    setIsOn(!isOn);
    onChange && onChange(!isOn);
  };

  return (
    <div
      className={`switch ${isOn ? "on" : ""}`}
      onClick={toggle}
      role="switch"
    >
      <div className="switch-handle" />
    </div>
  );
}