export function PrimaryButton({ small, wide, onClick=null, children }) {
  return (
    <button className={'button primary-button' + (wide? ' wide' : '') + (small? ' small' : '')} onClick={onClick}>
      {children}
    </button>
  )
}

export function SecondaryButton({ small, wide, onClick=null, children }) {
  return (
    <button className={'button secondary-button' + (wide? ' wide' : '') + (small? ' small' : '')} onClick={onClick}>
      {children}
    </button>
  )
}

export function TertiaryButton({ small, wide, onClick=null, children }) {
  return (
    <button className={'button tertiary-button' + (wide? ' wide' : '') + (small? ' small' : '')} onClick={onClick}>
      {children}
    </button>
  )
}

export function DangerButton({ small, wide, onClick=null, children }) {
  return (
    <button className={'button danger-button' + (wide? ' wide' : '') + (small? ' small' : '')} onClick={onClick}>
      {children}
    </button>
  )
}
