'use client'

import React, { useState, useEffect } from 'react'

export type LayoutMode = 'browse' | 'ordering' | 'reservation' | 'query'

interface DynamicLayoutProps {
  children: React.ReactNode
  sidePanel?: React.ReactNode
  mode: LayoutMode
  className?: string
}

export default function DynamicLayout({ 
  children, 
  sidePanel, 
  mode, 
  className = '' 
}: DynamicLayoutProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [mode])

  const getLayoutClasses = () => {
    const baseClasses = "transition-all duration-300 ease-in-out"
    
    switch (mode) {
      case 'ordering':
      case 'reservation':
        return `${baseClasses} flex flex-row h-full`
      case 'browse':
      case 'query':
      default:
        return `${baseClasses} flex flex-col h-full`
    }
  }

  const getMainContentClasses = () => {
    switch (mode) {
      case 'ordering':
      case 'reservation':
        return "flex-1 w-3/5 overflow-y-auto border-r border-gray-200"
      case 'browse':
      case 'query':
      default:
        return "flex-1 w-full overflow-y-auto"
    }
  }

  const getSidePanelClasses = () => {
    return "w-2/5 bg-gray-50 border-l border-gray-200 overflow-y-auto"
  }

  return (
    <div className={`${getLayoutClasses()} ${className} ${isAnimating ? 'opacity-90' : 'opacity-100'}`}>
      {/* Main Content Area */}
      <div className={getMainContentClasses()}>
        {children}
      </div>

      {/* Side Panel - Only show in split modes */}
      {(mode === 'ordering' || mode === 'reservation') && sidePanel && (
        <div className={getSidePanelClasses()}>
          {sidePanel}
        </div>
      )}
    </div>
  )
}
