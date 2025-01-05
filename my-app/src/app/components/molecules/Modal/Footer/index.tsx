import React from 'react'

interface ModalFooterProps {
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
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  display = 'flex',
  alignItems = 'items-center',
  justifyContent = 'justify-between',
  padding = 'py-4 px-6',
  backgroundColor = 'bg-gray-100',
}) => {
  const footerStyle = {
    padding,
    backgroundColor,
  }

  return (
    <div
      className={`${display} ${alignItems} ${justifyContent} border-t border-gray-200`}
      style={footerStyle}
    >
      {children}
    </div>
  )
}

export default ModalFooter
