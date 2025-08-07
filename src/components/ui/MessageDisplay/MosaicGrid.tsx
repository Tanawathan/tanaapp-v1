'use client'

import React from 'react'

export type GridSize = '1x1' | '2x1' | '1x2' | '2x2'

interface MosaicGridProps {
  size: GridSize
  children: React.ReactNode
  className?: string
  gap?: 'sm' | 'md' | 'lg'
}

export default function MosaicGrid({ 
  size, 
  children, 
  className = '',
  gap = 'md'
}: MosaicGridProps) {
  const getGridClasses = () => {
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4'
    }

    const sizeClasses = {
      '1x1': 'grid-cols-1 grid-rows-1',
      '2x1': 'grid-cols-2 grid-rows-1',
      '1x2': 'grid-cols-1 grid-rows-2', 
      '2x2': 'grid-cols-2 grid-rows-2'
    }

    return `grid ${sizeClasses[size]} ${gapClasses[gap]}`
  }

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  )
}
