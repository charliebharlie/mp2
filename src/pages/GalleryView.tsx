import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePokemon } from '../context/pokemonContext'
import { useQueryParams } from '../hooks/useQueryParams'
import { Notice } from '../components/Notice'
import { PageHeader } from '../components/PageHeader'
import { SegmentedControl } from '../components/SegmentedControl'
import { TypeBadge } from '../components/TypeBadge'
import { TypeFilter } from '../components/TypeFilter'
import { detailPath, galleryResults, readGalleryParams } from '../utils/browse'
import { collectTypes, formatName, formatNumber, type TypeMatch } from '../utils/pokemon'
import controls from '../styles/controls.module.css'
import styles from './GalleryView.module.css'

const MATCH_OPTIONS: { value: TypeMatch; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'all', label: 'All' },
]

export function GalleryView() {
  const { pokemon, status, error, refetch } = usePokemon()

  const [params, setParam] = useQueryParams()
  const allTypes = useMemo(() => collectTypes(pokemon), [pokemon])
  const { selected, match } = readGalleryParams(params, allTypes)
  const results = galleryResults(pokemon, { selected, match })

  function toggleType(type: string) {
    const next = selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type]
    setParam('types', next.join(','))
  }

  const matchHint =
    selected.length === 0
      ? 'Select one or more types to filter the gallery.'
      : selected.length === 1
        ? `Showing ${selected[0]} Pokémon. Select another type to combine.`
        : match === 'any'
        ? `Showing Pokémon with any of: ${selected.join(', ')}.`
        : `Showing Pokémon with all of: ${selected.join(' + ')}.`

  return (
    <section className={styles.page} aria-labelledby="gallery-heading">
      <PageHeader id="gallery-heading" title="Gallery" subtitle="Browse official artwork and filter by type." />

      {status === 'success' && (
        <div className={styles.filters}>
          <fieldset className={controls.field}>
            <legend className="visually-hidden">Filter by type</legend>
            <div className={styles.filterHead}>
              <span className={controls.fieldLabel} aria-hidden="true">
                Types
              </span>
              <button
                type="button"
                className={controls.textButton}
                onClick={() => setParam('types', '')}
                disabled={selected.length === 0}
              >
                Clear
              </button>
            </div>
            <TypeFilter types={allTypes} selected={selected} onToggle={toggleType} />
          </fieldset>

          <div className={styles.matchRow}>
            <div className={controls.field}>
              <span className={controls.fieldLabel}>Match</span>
              <SegmentedControl
                label="Match any or all selected types"
                options={MATCH_OPTIONS}
                value={match}
                onChange={(v) => setParam('match', v, 'any')}
              />
            </div>
            <p className={styles.hint}>{matchHint}</p>
          </div>
        </div>
      )}

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
            <Notice message={`No Pokémon are ${selected.join(' + ')} type.`} />
          ) : (
            <ul className={styles.grid}>
              {results.map((p) => (
                <li key={p.id}>
                  <Link to={detailPath(p.id, 'gallery', params)} className={styles.card} data-type={p.types[0]}>
                    <div className={styles.art}>
                      <img src={p.image} alt="" loading="lazy" width={475} height={475} />
                    </div>
                    <div className={styles.info}>
                      <span className={styles.number}>{formatNumber(p.id)}</span>
                      <span className={styles.name}>{formatName(p.name)}</span>
                      <span className={styles.types}>
                        {p.types.map((t) => (
                          <TypeBadge key={t} type={t} />
                        ))}
                      </span>
                    </div>
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
