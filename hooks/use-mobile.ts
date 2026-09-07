import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    
    // Set initial state without triggering a synchronous re-render in the effect body
    // by checking if it's already set to the correct value, though the standard pattern
    // is to just set it in the useState initializer if we are on client, but Next.js
    // SSR means we start undefined. We can use a small timeout to avoid sync state update.
    setTimeout(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }, 0)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
