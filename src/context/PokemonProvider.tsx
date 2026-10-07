import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import axios from 'axios'
import { clearCache, fetchGen1Pokemon, readCache } from '../api/pokeapi'
import type { ApiStatus, Pokemon } from '../types/pokemon'
import { PokemonContext, type PokemonContextValue } from './pokemonContext'

function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 429) return 'PokeAPI rate limit hit. Please try again in a moment.'
    if (err.response) return `PokeAPI responded with ${err.response.status}.`
    return 'Could not reach PokeAPI. Check your connection.'
  }
  return err instanceof Error ? err.message : 'Something went wrong.'
}

export function PokemonProvider({ children }: { children: ReactNode }) {
  // Seed from the cache synchronously so cached visits skip the loading state.
  const [pokemon, setPokemon] = useState<Pokemon[]>(() => readCache() ?? [])
  const [status, setStatus] = useState<ApiStatus>(() => (pokemon.length ? 'success' : 'loading'))
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (status === 'success' && reloadKey === 0) return

    const controller = new AbortController()
    fetchGen1Pokemon(controller.signal)
      .then((data) => {
        setPokemon(data)
        setStatus('success')
      })
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return
        setError(errorMessage(err))
        setStatus('error')
      })

    return () => controller.abort()
    // Only re-run when a refetch is requested; `status` is read just for the initial cache check.
  }, [reloadKey]) // oxlint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    clearCache()
    setStatus('loading')
    setError(null)
    setReloadKey((k) => k + 1)
  }, [])

  const byId = useMemo(() => new Map(pokemon.map((p) => [p.id, p])), [pokemon])
  const getById = useCallback((id: number) => byId.get(id), [byId])

  const value = useMemo<PokemonContextValue>(
    () => ({ pokemon, status, error, getById, refetch }),
    [pokemon, status, error, getById, refetch],
  )

  return <PokemonContext.Provider value={value}>{children}</PokemonContext.Provider>
}
