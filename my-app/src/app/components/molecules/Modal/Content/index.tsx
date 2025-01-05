import React from 'react'

interface ModalContentProps {
  children: React.ReactNode
  backgroundColor?: string
  textColor?: string
  textJustify?: 'text-left' | 'text-center' | 'text-right'
  fontSize?: string
  padding?: string
  paragraphSpacing?: string
  borderRadius?: 'none' | 'small' | 'medium' | 'large'
}

const ModalContent: React.FC<ModalContentProps> = ({
  children,
  backgroundColor = 'bg-white',
  textColor = 'text-gray-600',
  textJustify = 'text-left',
  fontSize = 'text-base',
  padding = 'p-6',
  paragraphSpacing = 'mb-4',
  borderRadius = 'none',
}) => {
  const getBorderRadiusClass = () => {
    switch (borderRadius) {
      case 'small':
        return 'rounded-sm'
      case 'medium':
        return 'rounded-md'
      case 'large':
        return 'rounded-lg'
      case 'none':
      default:
        return ''
    }
  }

  return (
    <div
      className={`${backgroundColor} ${textColor} ${textJustify} ${fontSize} ${padding} ${getBorderRadiusClass()}`}
    >
      {React.Children.map(children, (child, index) => {
        const additionalClass =
          index < React.Children.count(children) - 1 ? paragraphSpacing : ''
        return <div className={`${additionalClass}`}>{child}</div>
      })}
    </div>
  )
}

export default ModalContent
