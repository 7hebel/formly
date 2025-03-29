
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

export function Input({ id, type="text", placeholder, value, pattern, minlen, maxlen, onChange, ref }) {
  if (pattern==null && type=="number") pattern = "[\d]"
  
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
      defaultValue={value}
      ref={ref}
    ></input>
  )
}

export function LongInput({ id, placeholder, minlen, onChange, ref, defaultValue }) {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      className="input-element"
      minLength={minlen}
      ref={ref}
      onChange={onChange}
      defaultValue={defaultValue}
    ></textarea>
  )
}

export function DatetimeInput({ id }) {
  <input type="datetime-local" className="input-element"></input>

}
