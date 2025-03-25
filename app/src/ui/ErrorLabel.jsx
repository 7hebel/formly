import { AlertCircle } from 'lucide-react'

export function ErrorLabel({ id, children }) {
  return (
    <small id={id} className="error-label" iserror={0}>
      <AlertCircle/>
      {children}
    </small>
  )
}
