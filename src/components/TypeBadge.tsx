import styles from './TypeBadge.module.css'

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className={styles.badge} data-type={type}>
      {type}
    </span>
  )
}
