import axios from 'axios'
import type { Pokemon, PokeApiPokemonResponse } from '../types/pokemon'

export const GEN1_COUNT = 151

const CACHE_KEY = 'pokedex:gen1:v1'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 1 week
// Limit parallel requests so we don't hammer PokeAPI with 151 at once.
const BATCH_SIZE = 20

const client = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 10000,
})

interface CacheEntry {
  savedAt: number
  data: Pokemon[]
}

function toPokemon(raw: PokeApiPokemonResponse): Pokemon {
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height,
    weight: raw.weight,
    baseExperience: raw.base_experience ?? 0,
    types: [...raw.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    abilities: raw.abilities.map((a) => a.ability.name),
    stats: raw.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    image: raw.sprites.other?.['official-artwork']?.front_default ?? raw.sprites.front_default ?? '',
    sprite: raw.sprites.front_default ?? '',
  }
}

export function readCache(): Pokemon[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (Date.now() - entry.savedAt > CACHE_TTL_MS) return null
    if (!Array.isArray(entry.data) || entry.data.length !== GEN1_COUNT) return null
    return entry.data
  } catch {
    return null
  }
}

function writeCache(data: Pokemon[]) {
  try {
    const entry: CacheEntry = { savedAt: Date.now(), data }
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Storage full or unavailable (e.g. private mode) -- app still works without the cache.
  }
}

export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

async function fetchPokemon(id: number, signal?: AbortSignal): Promise<Pokemon> {
  const res = await client.get<PokeApiPokemonResponse>(`/pokemon/${id}`, { signal })
  return toPokemon(res.data)
}

// Fetches all Gen 1 Pokemon, using the localStorage cache when it is fresh.
export async function fetchGen1Pokemon(signal?: AbortSignal): Promise<Pokemon[]> {
  const cached = readCache()
  if (cached) return cached

  const ids = Array.from({ length: GEN1_COUNT }, (_, i) => i + 1)
  const results: Pokemon[] = []
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE)
    results.push(...(await Promise.all(batch.map((id) => fetchPokemon(id, signal)))))
  }

  writeCache(results)
  return results
}
