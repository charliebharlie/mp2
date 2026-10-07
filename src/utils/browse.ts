import type { Pokemon } from '../types/pokemon'
import {
  collectTypes,
  filterByTypes,
  filterPokemon,
  isSortKey,
  sortPokemon,
  type SortKey,
  type SortOrder,
  type TypeMatch,
} from './pokemon'

// The list and gallery keep their state in URL params. The detail view gets the same
// params (plus `from`) so prev/next can step through exactly what the user was looking at.

export type BrowseSource = 'list' | 'gallery'

export interface ListParams {
  query: string
  sortKey: SortKey
  order: SortOrder
}

export interface GalleryParams {
  selected: string[]
  match: TypeMatch
}

export function readListParams(params: URLSearchParams): ListParams {
  const sort = params.get('sort')
  return {
    query: params.get('q') ?? '',
    sortKey: isSortKey(sort) ? sort : 'id',
    order: params.get('order') === 'desc' ? 'desc' : 'asc',
  }
}

export function readGalleryParams(params: URLSearchParams, allTypes: string[]): GalleryParams {
  return {
    selected: (params.get('types') ?? '').split(',').filter((t) => allTypes.includes(t)),
    match: params.get('match') === 'all' ? 'all' : 'any',
  }
}

export function listResults(pokemon: Pokemon[], { query, sortKey, order }: ListParams): Pokemon[] {
  return sortPokemon(filterPokemon(pokemon, query), sortKey, order)
}

export function galleryResults(pokemon: Pokemon[], { selected, match }: GalleryParams): Pokemon[] {
  return filterByTypes(pokemon, selected, match)
}

export function readSource(params: URLSearchParams): BrowseSource | null {
  const from = params.get('from')
  return from === 'list' || from === 'gallery' ? from : null
}

// The ordered Pokemon the detail view cycles through. Falls back to all Pokemon by number
// when opened directly (no `from`) or when the current one isn't in the filtered results.
export function browseSequence(pokemon: Pokemon[], params: URLSearchParams, currentId: number): Pokemon[] {
  const source = readSource(params)
  let sequence = pokemon
  if (source === 'list') sequence = listResults(pokemon, readListParams(params))
  if (source === 'gallery') sequence = galleryResults(pokemon, readGalleryParams(params, collectTypes(pokemon)))
  return sequence.some((p) => p.id === currentId) ? sequence : pokemon
}

export function detailPath(id: number, source: BrowseSource, params: URLSearchParams): string {
  const next = new URLSearchParams(params)
  next.set('from', source)
  return `/pokemon/${id}?${next.toString()}`
}

// Where the "Back" link goes, restoring the list/gallery filters.
export function backPath(params: URLSearchParams): { to: string; label: string } {
  const source = readSource(params)
  const rest = new URLSearchParams(params)
  rest.delete('from')
  const search = rest.toString() ? `?${rest.toString()}` : ''
  return source === 'gallery' ? { to: `/gallery${search}`, label: 'Back to gallery' } : { to: `/${search}`, label: 'Back to list' }
}
