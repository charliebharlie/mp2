import { createContext, useContext } from 'react'
import type { ApiStatus, Pokemon } from '../types/pokemon'

export interface PokemonContextValue {
  pokemon: Pokemon[]
  status: ApiStatus
  error: string | null
  getById: (id: number) => Pokemon | undefined
  // Clears the cache and fetches fresh data from PokeAPI.
  refetch: () => void
}

export const PokemonContext = createContext<PokemonContextValue | null>(null)

export function usePokemon(): PokemonContextValue {
  const ctx = useContext(PokemonContext)
  if (!ctx) throw new Error('usePokemon must be used inside <PokemonProvider>')
  return ctx
}
