// Trimmed-down Pokemon shape used throughout the app (and stored in the cache).
export interface PokemonStat {
  name: string
  value: number
}

export interface Pokemon {
  id: number
  name: string
  height: number // decimetres
  weight: number // hectograms
  baseExperience: number
  types: string[]
  abilities: string[]
  stats: PokemonStat[]
  image: string // official artwork
  sprite: string // small front sprite
}

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

// Subset of the raw /pokemon/{id} response from PokeAPI that we read from.
export interface PokeApiPokemonResponse {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number | null
  types: { slot: number; type: { name: string } }[]
  abilities: { ability: { name: string } }[]
  stats: { base_stat: number; stat: { name: string } }[]
  sprites: {
    front_default: string | null
    other?: {
      'official-artwork'?: { front_default: string | null }
    }
  }
}
