import controls from '../styles/controls.module.css'
import styles from './Notice.module.css'

interface Props {
  message: string
  action?: { label: string; onClick: () => void }
  isError?: boolean
}

// Placeholder box for loading / error / empty states.
export function Notice({ message, action, isError = false }: Props) {
  return (
    <div className={styles.notice} role={isError ? 'alert' : 'status'}>
      <p className={styles.message}>{message}</p>
      {action && (
        <button type="button" className={controls.button} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
