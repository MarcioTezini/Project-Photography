import React from 'react'

interface ModalHeaderProps {
  children: React.ReactNode
  display?: 'flex' | 'block'
  alignItems?: 'items-start' | 'items-center' | 'items-end'
  justifyContent?:
    | 'justify-start'
    | 'justify-center'
    | 'justify-end'
    | 'justify-between'
    | 'justify-around'
  padding?: string
  backgroundColor?: string
  borderRadius?: 'rounded-none' | 'rounded-sm' | 'rounded-lg'
  borderBottom?: boolean
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  display = 'flex',
  alignItems = 'items-center',
  justifyContent = 'justify-between',
  padding = 'py-4 px-6',
  backgroundColor = 'bg-gray-100',
  borderRadius = 'rounded-none',
  borderBottom = false,
}) => {
  const headerStyle = {
    padding,
    backgroundColor,
  }

  return (
    <div
      className={`${display} ${alignItems} ${justifyContent} ${borderRadius !== 'rounded-none' ? borderRadius : ''} ${borderBottom ? 'border-b border-gray-200' : ''}`}
      style={headerStyle}
    >
      {children}
    </div>
  )
}

export default ModalHeader
