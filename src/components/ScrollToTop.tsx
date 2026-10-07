import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Jump to the top when moving to a new page. Browser back/forward (POP) is left alone
// so the browser can restore the previous scroll position.
export function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0)
  }, [pathname, navigationType])

  return null
}
