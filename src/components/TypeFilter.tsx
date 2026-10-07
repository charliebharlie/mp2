import styles from './TypeFilter.module.css'

interface Props {
  types: string[]
  selected: string[]
  onToggle: (type: string) => void
}

// Multi-select chips, one per type. Uses the shared [data-type] colors.
export function TypeFilter({ types, selected, onToggle }: Props) {
  return (
    <ul className={styles.chips}>
      {types.map((t) => {
        const isOn = selected.includes(t)
        return (
          <li key={t}>
            <button
              type="button"
              className={styles.chip}
              data-type={t}
              aria-pressed={isOn}
              onClick={() => onToggle(t)}
            >
              <span className={styles.check} aria-hidden="true">
                {isOn ? '✓' : ''}
              </span>
              {t}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
