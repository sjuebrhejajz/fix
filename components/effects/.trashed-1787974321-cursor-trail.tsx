'use client'

import { useEffect, useRef } from 'react'

export function CursorTrail({ color }: { color: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return
    const container = containerRef.current
    if (!container) return

    const dots: { el: HTMLDivElement; x: number; y: number }[] = []
    const count = 14
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div')
      dot.style.position = 'fixed'
      dot.style.width = '6px'
      dot.style.height = '6px'
      dot.style.borderRadius = '50%'
      dot.style.pointerEvents = 'none'
      dot.style.transform = 'translate(-50%, -50%)'
      dot.style.zIndex = '9999'
      container.appendChild(dot)
      dots.push({ el: dot, x: 0, y: 0 })
    }

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', onMove)

    let raf: number
    const animate = () => {
      let x = mouseX
      let y = mouseY
      dots.forEach((dot, i) => {
        dot.x += (x - dot.x) * 0.35
        dot.y += (y - dot.y) * 0.35
        dot.el.style.left = `${dot.x}px`
        dot.el.style.top = `${dot.y}px`
        const scale = (count - i) / count
        dot.el.style.opacity = `${scale * 0.7}`
        dot.el.style.transform = `translate(-50%, -50%) scale(${scale})`
        dot.el.style.background = color
        x = dot.x
        y = dot.y
      })
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      dots.forEach((d) => d.el.remove())
    }
  }, [color])

  return <div ref={containerRef} aria-hidden="true" />
}
