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

export function Input({ id, type, placeholder=null }) {
  return (
    <input 
      id={id} 
      type={type} 
      className="input-element" 
      placeholder={placeholder}
      pattern={(type=="number"? "[\d]" : "")}
      >
    </input>
  )
}

// InputGroup, InputLabel, Input