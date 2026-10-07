import type { Pokemon } from '../types/pokemon'

export type SortKey = 'id' | 'name' | 'baseExperience' | 'height'
export type SortOrder = 'asc' | 'desc'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'id', label: 'Number' },
  { key: 'name', label: 'Name' },
  { key: 'baseExperience', label: 'Base experience' },
  { key: 'height', label: 'Height' },
]

export function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((o) => o.key === value)
}

// Matches by name substring, or by Pokedex number ("25", "#025").
export function filterPokemon(list: Pokemon[], query: string): Pokemon[] {
  // API names are hyphenated ("mr-mime"), so let "mr mime" match too.
  const q = query.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-')
  if (!q) return list
  const asNumber = /^\d+$/.test(q) ? Number(q) : null
  return list.filter((p) => p.name.includes(q) || (asNumber !== null && p.id === asNumber))
}

export function sortPokemon(list: Pokemon[], key: SortKey, order: SortOrder): Pokemon[] {
  const dir = order === 'asc' ? 1 : -1
  return [...list].sort((a, b) => {
    const cmp = key === 'name' ? a.name.localeCompare(b.name) : a[key] - b[key]
    // Fall back to Pokedex number so ties have a stable, predictable order.
    return (cmp || a.id - b.id) * dir
  })
}

export function formatNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

export function formatName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

// PokeAPI height is in decimetres.
export function formatHeight(height: number): string {
  return `${(height / 10).toFixed(1)} m`
}

export type TypeMatch = 'any' | 'all'

// "any": has at least one selected type. "all": has every selected type.
export function filterByTypes(list: Pokemon[], selected: string[], match: TypeMatch): Pokemon[] {
  if (selected.length === 0) return list
  return list.filter((p) =>
    match === 'all' ? selected.every((t) => p.types.includes(t)) : selected.some((t) => p.types.includes(t)),
  )
}

// Every type present in the data, alphabetically.
export function collectTypes(list: Pokemon[]): string[] {
  return [...new Set(list.flatMap((p) => p.types))].sort()
}

// PokeAPI weight is in hectograms.
export function formatWeight(weight: number): string {
  return `${(weight / 10).toFixed(1)} kg`
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
}

export function formatStatName(name: string): string {
  return STAT_LABELS[name] ?? formatName(name)
}
