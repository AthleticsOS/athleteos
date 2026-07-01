'use client'

import { useEffect } from 'react'

// Aplica clases móviles a grids con estilos inline en todas las páginas del panel
export default function MobileGridFix() {
  useEffect(() => {
    function fix() {
      const isMobile = window.innerWidth <= 768
      document.querySelectorAll<HTMLElement>('[style*="grid-template-columns"]').forEach(el => {
        const style = el.getAttribute('style') || ''
        if (isMobile) {
          // Guardar valor original
          if (!el.dataset.origGrid) {
            el.dataset.origGrid = el.style.gridTemplateColumns
          }
          const cols = el.dataset.origGrid || ''
          // Grids de 3+ columnas → 1 columna
          if (/repeat\([3-9]/.test(cols)) {
            el.style.gridTemplateColumns = '1fr'
          }
          // Grids de 2 columnas con columna grande fija → 1 columna
          else if (/1fr\s+\d{2,3}px/.test(cols) || /\d{2,3}px\s+1fr/.test(cols)) {
            el.style.gridTemplateColumns = '1fr'
          }
          // repeat(2,1fr) → mantener en móvil (sirven para cards pequeñas)
        } else {
          // Restaurar en escritorio
          if (el.dataset.origGrid) {
            el.style.gridTemplateColumns = el.dataset.origGrid
          }
        }
      })
    }

    fix()
    window.addEventListener('resize', fix)

    // Observar cambios en el DOM (navegación entre páginas)
    const observer = new MutationObserver(fix)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('resize', fix)
      observer.disconnect()
    }
  }, [])

  return null
}
