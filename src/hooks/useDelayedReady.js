import { useEffect, useState } from 'react'

export function useDelayedReady(delay = 350) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  return ready
}
