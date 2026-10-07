import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// Page filters live in the URL so they survive navigating away and back.
// Returns the raw params plus a setter that drops a key when it equals its default.
export function useQueryParams() {
  const [params, setParams] = useSearchParams()

  const setParam = useCallback(
    (name: string, value: string, defaultValue = '') => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value === defaultValue) next.delete(name)
          else next.set(name, value)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return [params, setParam] as const
}
