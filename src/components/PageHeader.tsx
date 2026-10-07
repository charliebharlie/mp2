import styles from './PageHeader.module.css'

export function PageHeader({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <header className={styles.header}>
      <h1 id={id} className={styles.title}>
        {title}
      </h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  )
}
