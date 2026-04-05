import { useEffect } from 'react'

type BodyScrollLockMode = 'hidden' | 'visible'

export function useBodyScrollLock(mode: BodyScrollLockMode = 'visible') {
  useEffect(() => {
    const { body } = document
    const scrollY = window.scrollY
    const previousPosition = body.style.position
    const previousTop = body.style.top
    const previousWidth = body.style.width
    const previousOverflowY = body.style.overflowY

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflowY = mode === 'hidden' ? 'hidden' : 'scroll'

    return () => {
      const storedTop = body.style.top

      body.style.position = previousPosition
      body.style.top = previousTop
      body.style.width = previousWidth
      body.style.overflowY = previousOverflowY

      window.scrollTo(0, Number.parseInt(storedTop || '0', 10) * -1)
    }
  }, [mode])
}
