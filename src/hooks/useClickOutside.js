import { useEffect, useRef } from 'react'

export function useClickOutside(handler) {
  const ref = useRef(null)

  useEffect(() => {
    function onPointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event)
      }
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') handler(event)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [handler])

  return ref
}
