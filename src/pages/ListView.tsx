import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePokemon } from '../context/pokemonContext'
import { useQueryParams } from '../hooks/useQueryParams'
import { Notice } from '../components/Notice'
import { PageHeader } from '../components/PageHeader'
import { SegmentedControl } from '../components/SegmentedControl'
import { TypeBadge } from '../components/TypeBadge'
import { detailPath, listResults, readListParams } from '../utils/browse'
import { SORT_OPTIONS, formatHeight, formatName, formatNumber, type SortOrder } from '../utils/pokemon'
import controls from '../styles/controls.module.css'
import styles from './ListView.module.css'

const ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'asc', label: '↑ Asc' },
  { value: 'desc', label: '↓ Desc' },
]

export function ListView() {
  const { pokemon, status, error, refetch } = usePokemon()

  const [params, setParam] = useQueryParams()
  const { query, sortKey, order } = readListParams(params)

  const results = useMemo(
    () => listResults(pokemon, { query, sortKey, order }),
    [pokemon, query, sortKey, order],
  )

  return (
    <section className={styles.page} aria-labelledby="list-heading">
      <PageHeader id="list-heading" title="Pokédex" subtitle="Search and sort the original 151 Pokémon." />

      <div className={styles.controls}>
        <label className={controls.field}>
          <span className={controls.fieldLabel}>Search</span>
          <input
            type="search"
            className={controls.input}
            placeholder="Search by name or number…"
            value={query}
            onChange={(e) => setParam('q', e.target.value)}
            autoComplete="off"
          />
        </label>

        <label className={controls.field}>
          <span className={controls.fieldLabel}>Sort by</span>
          <select className={controls.select} value={sortKey} onChange={(e) => setParam('sort', e.target.value, 'id')}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <SegmentedControl
          label="Sort order"
          options={ORDER_OPTIONS}
          value={order}
          onChange={(v) => setParam('order', v, 'asc')}
        />
      </div>

      {status === 'loading' && <Notice message="Loading Pokémon…" />}

      {status === 'error' && (
        <Notice isError message={error ?? 'Something went wrong.'} action={{ label: 'Try again', onClick: refetch }} />
      )}

      {status === 'success' && (
        <>
          <p className={styles.count} aria-live="polite">
            {results.length} of {pokemon.length} Pokémon
          </p>

          {results.length === 0 ? (
            <Notice
              message={`No Pokémon match “${query}”.`}
              action={{ label: 'Clear search', onClick: () => setParam('q', '') }}
            />
          ) : (
            <ul className={styles.list}>
              <li className={`${styles.row} ${styles.headRow}`} aria-hidden="true">
                <span />
                <span>No.</span>
                <span>Name</span>
                <span>Type</span>
                <span className={styles.numeric}>Base exp</span>
                <span className={styles.numeric}>Height</span>
              </li>
              {results.map((p) => (
                <li key={p.id}>
                  <Link to={detailPath(p.id, 'list', params)} className={styles.row}>
                    <img className={styles.sprite} src={p.sprite} alt="" loading="lazy" width={56} height={56} />
                    <span className={styles.number}>{formatNumber(p.id)}</span>
                    <span className={styles.name}>{formatName(p.name)}</span>
                    <span className={styles.types}>
                      {p.types.map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                    </span>
                    <span className={`${styles.numeric} ${styles.exp}`}>
                      <span className={styles.mobileLabel}>Base exp </span>
                      {p.baseExperience}
                    </span>
                    <span className={`${styles.numeric} ${styles.height}`}>
                      <span className={styles.mobileLabel}>Height </span>
                      {formatHeight(p.height)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
