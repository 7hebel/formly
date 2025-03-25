import { IconoirProvider } from "iconoir-react"

export function PrimaryButton({ wide, onClick=null, children }) {
  return (
    <button className={'button primary-button' + (wide? ' wide' : '')} onClick={onClick}>
      <IconoirProvider iconProps={{
          strokeWidth: 2.5,
          width: '14px',
          height: '14px',
        }}>
        {children}
      </IconoirProvider>
    </button>
  )
}

export function SecondaryButton({ wide, onClick=null, children }) {
  return (
    <button className={'button secondary-button' + (wide? ' wide' : '')} onClick={onClick}>
      <IconoirProvider iconProps={{
          strokeWidth: 2.5,
          width: '14px',
          height: '14px',
        }}>
        {children}
      </IconoirProvider>
    </button>
  )
}

export function TertiaryButton({ wide, onClick=null, children }) {
  return (
    <button className={'button tertiary-button' + (wide? ' wide' : '')} onClick={onClick}>
      <IconoirProvider iconProps={{
          strokeWidth: 2.5,
          width: '14px',
          height: '14px',
        }}>
        {children}
      </IconoirProvider>
    </button>
  )
}
