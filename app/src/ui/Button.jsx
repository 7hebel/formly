import { IconoirProvider } from "iconoir-react"

export function PrimaryButton({ children }) {
  return (
    <button className='button primary-button'>
      <IconoirProvider iconProps={{
          strokeWidth: 2.5,
          width: '13px',
          height: '13px',
        }}>
        {children}
      </IconoirProvider>
    </button>
  )
}

export function SecondaryButton({ children }) {
  return (
    <button className='button secondary-button'>
      <IconoirProvider iconProps={{
          strokeWidth: 2.5,
          width: '13px',
          height: '13px',
        }}>
        {children}
      </IconoirProvider>
    </button>
  )
}

export function TertiaryButton({ children }) {
  return (
    <button className='button tertiary-button'>
      <IconoirProvider iconProps={{
          strokeWidth: 2.5,
          width: '13px',
          height: '13px',
        }}>
        {children}
      </IconoirProvider>
    </button>
  )
}
