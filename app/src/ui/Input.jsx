
export function InputGroup({ children }) {
  return (
    <div className="input-group">{children}</div>
  )
}

export function InputLabel({ children }) {
  return (
    <p className="input-label">{children}</p>
  )
}

export function Input({ id, type="text", placeholder, value, pattern, minlen, maxlen, onChange, onBlur, ref, min, max, locked, groupName }) {
  if (pattern==null && type=="number") pattern = "^\d*\.?\d*$";
  if (pattern == null && type == "email") pattern = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$";

  return (
    <input 
      id={id} 
      type={type} 
      className="input-element" 
      placeholder={placeholder}
      pattern={pattern}
      minLength={minlen}
      maxLength={maxlen}
      onChange={onChange}
      onBlur={onBlur}
      defaultValue={value}
      ref={ref}
      step="any"
      min={min ?? undefined}
      max={max ?? undefined}
      disabled={locked}
      group={groupName}
    ></input>
  )
}

export function LongInput({ id, placeholder, minlen, onChange, ref, defaultValue, locked }) {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      className="input-element"
      minLength={minlen}
      ref={ref}
      onChange={onChange}
      defaultValue={defaultValue}
      disabled={locked}
    ></textarea>
  )
}

export function DatetimeInput({ id }) {
  <input type="datetime-local" className="input-element"></input>

}
