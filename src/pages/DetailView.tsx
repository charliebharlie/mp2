import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { usePokemon } from '../context/pokemonContext'
import { Notice } from '../components/Notice'
import { TypeBadge } from '../components/TypeBadge'
import { backPath, browseSequence } from '../utils/browse'
import { formatHeight, formatName, formatNumber, formatStatName, formatWeight } from '../utils/pokemon'
import styles from './DetailView.module.css'

// Highest base stat any Pokemon has (Blissey's HP); used as the meter scale.
const MAX_STAT = 255

export function DetailView() {
  const { id: idParam } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { pokemon, status, error, refetch, getById } = usePokemon()

  const id = Number(idParam)
  const current = Number.isInteger(id) ? getById(id) : undefined
  const back = backPath(params)

  // Prev/next walk the same filtered + sorted order the user came from, wrapping at the ends.
  const { prev, next, position, total } = useMemo(() => {
    if (!current) return { prev: undefined, next: undefined, position: 0, total: 0 }
    const sequence = browseSequence(pokemon, params, current.id)
    const index = sequence.findIndex((p) => p.id === current.id)
    const at = (i: number) => sequence[(i + sequence.length) % sequence.length]
    return { prev: at(index - 1), next: at(index + 1), position: index + 1, total: sequence.length }
  }, [pokemon, params, current])

  // Keep the list/gallery params so the Back link and further prev/next still work.
  const search = params.toString() ? `?${params.toString()}` : ''
  const prevPath = prev && `/pokemon/${prev.id}${search}`
  const nextPath = next && `/pokemon/${next.id}${search}`

  // Left/right arrow keys also cycle, unless the user is typing somewhere.
  useEffect(() => {
    if (!prevPath || !nextPath) return
    const toPrev = prevPath
    const toNext = nextPath
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      if (e.target instanceof HTMLElement && e.target.closest('input, select, textarea')) return
      if (e.key === 'ArrowLeft') navigate(toPrev)
      if (e.key === 'ArrowRight') navigate(toNext)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevPath, nextPath, navigate])

  useEffect(() => {
    if (current) document.title = `${formatName(current.name)} · Gen 1 Pokédex`
    return () => {
      document.title = 'Gen 1 Pokédex'
    }
  }, [current])

  if (status === 'loading') return <Notice message="Loading Pokémon…" />
  if (status === 'error') {
    return <Notice isError message={error ?? 'Something went wrong.'} action={{ label: 'Try again', onClick: refetch }} />
  }
  if (!current || !prev || !next || !prevPath || !nextPath) {
    return (
      <div className={styles.page}>
        <Notice message={`There's no Gen 1 Pokémon with number “${idParam}”. Try a number from 1 to 151.`} />
        <Link to="/" className={styles.backLink}>
          ← Back to list
        </Link>
      </div>
    )
  }

  const statTotal = current.stats.reduce((sum, s) => sum + s.value, 0)

  return (
    <article className={styles.page} aria-labelledby="detail-name">
      <div className={styles.topRow}>
        <Link to={back.to} className={styles.backLink}>
          ← {back.label}
        </Link>
        <span className={styles.position}>
          {position} of {total}
        </span>
      </div>

      <div className={styles.card} data-type={current.types[0]}>
        <div className={styles.art}>
          <img src={current.image} alt={`Official artwork of ${formatName(current.name)}`} width={475} height={475} />
        </div>

        <div className={styles.info}>
          <header className={styles.heading}>
            <span className={styles.number}>{formatNumber(current.id)}</span>
            <h1 id="detail-name" className={styles.name}>
              {formatName(current.name)}
            </h1>
            <span className={styles.types}>
              {current.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </span>
          </header>

          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>Height</dt>
              <dd>{formatHeight(current.height)}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Weight</dt>
              <dd>{formatWeight(current.weight)}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Base exp</dt>
              <dd>{current.baseExperience}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Abilities</dt>
              <dd className={styles.abilities}>{current.abilities.map(formatName).join(', ')}</dd>
            </div>
          </dl>

          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className={styles.sectionTitle}>
              Base stats
            </h2>
            <ul className={styles.stats}>
              {current.stats.map((s) => (
                <li key={s.name} className={styles.stat}>
                  <span className={styles.statName}>{formatStatName(s.name)}</span>
                  <span className={styles.statValue}>{s.value}</span>
                  <meter className={styles.meter} min={0} max={MAX_STAT} value={s.value} aria-label={formatStatName(s.name)} />
                </li>
              ))}
              <li className={`${styles.stat} ${styles.total}`}>
                <span className={styles.statName}>Total</span>
                <span className={styles.statValue}>{statTotal}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <nav className={styles.pager} aria-label="Previous and next Pokémon">
        <Link to={prevPath} className={styles.pagerLink} rel="prev">
          <span className={styles.pagerDir}>← Previous</span>
          <span className={styles.pagerName}>
            {formatNumber(prev.id)} {formatName(prev.name)}
          </span>
        </Link>
        <Link to={nextPath} className={`${styles.pagerLink} ${styles.pagerNext}`} rel="next">
          <span className={styles.pagerDir}>Next →</span>
          <span className={styles.pagerName}>
            {formatNumber(next.id)} {formatName(next.name)}
          </span>
        </Link>
      </nav>
      <p className={styles.keyHint}>Tip: use the ← and → arrow keys to cycle.</p>
    </article>
  )
}
