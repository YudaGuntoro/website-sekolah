'use client'

import { useEffect, useRef, useState } from 'react'

type SchoolHighlightsCounterProps = {
  value: string
}

export default function SchoolHighlightsCounter({ value }: SchoolHighlightsCounterProps) {
  const [count, setCount] = useState(0)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const target = Number.parseInt(value, 10)
    if (Number.isNaN(target)) return
    const suffix = value.replace(/^\d+/, '')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()

      if (reducedMotion) {
        setCount(target)
        return
      }

      const startedAt = performance.now()
      const duration = 1200
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = 1 - (1 - progress) ** 4
        setCount(Math.round(target * eased))
        if (progress < 1) frame = requestAnimationFrame(animate)
      }
      frame = requestAnimationFrame(animate)
    }, { threshold: 0.5 })

    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  const suffix = value.replace(/^\d+/, '')
  if (Number.isNaN(Number.parseInt(value, 10))) return <span aria-label={value}>{value}</span>
  return <span ref={elementRef} aria-label={value} aria-live='off'>{count}{suffix}</span>
}
