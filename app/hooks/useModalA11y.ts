'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Accessibility hook for modals: Escape to close, focus trap, restore focus on close.
 */
export function useModalA11y(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previousActiveRef = useRef<Element | null>(null)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return

    previousActiveRef.current = document.activeElement

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      if (previousActiveRef.current instanceof HTMLElement) {
        previousActiveRef.current.focus()
      }
    }
  }, [isOpen, handleEscape])

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const el = containerRef.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (first) first.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    el.addEventListener('keydown', handleTab)
    return () => el.removeEventListener('keydown', handleTab)
  }, [isOpen])

  return containerRef
}
