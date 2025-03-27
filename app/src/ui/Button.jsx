export function PrimaryButton({ wide, onClick=null, children }) {
  return (
    <button className={'button primary-button' + (wide? ' wide' : '')} onClick={onClick}>
      {children}
    </button>
  )
}

export function SecondaryButton({ wide, onClick=null, children }) {
  return (
    <button className={'button secondary-button' + (wide? ' wide' : '')} onClick={onClick}>
      {children}
    </button>
  )
}

export function TertiaryButton({ wide, onClick=null, children }) {
  return (
    <button className={'button tertiary-button' + (wide? ' wide' : '')} onClick={onClick}>
      {children}
    </button>
  )
}

export function DangerButton({ wide, onClick=null, children }) {
  return (
    <button className={'button danger-button' + (wide? ' wide' : '')} onClick={onClick}>
      {children}
    </button>
  )
}
