import { IconoirProvider } from "iconoir-react"


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

export function Input({ id, type="text", placeholder=null, pattern=null, minlen=null }) {
  if (pattern==null && type=="number") pattern = "[\d]"
  
  return (
    <input 
      id={id} 
      type={type} 
      className="input-element" 
      placeholder={placeholder}
      pattern={pattern}
      minLength={minlen}
      >
    </input>
  )
}

// InputGroup, InputLabel, Input