import React, { ButtonHTMLAttributes } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  variants?: 'success' | 'warning'
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variants,
  ...rest
}) => {
  let iconButtonColor = ''

  switch (variants) {
    case 'success': {
      iconButtonColor = 'bg-notify-success-normal'
      break
    }
    case 'warning': {
      iconButtonColor = 'bg-notify-warning-normal'
      break
    }
    default: {
      iconButtonColor = 'bg-fichasPay-main-400'
    }
  }

  return (
    <button
      {...rest}
      className={`
        ${iconButtonColor} 
        rounded-xs 
        shadow-DShadow-Default 
        px-xs 
        py-xxs 
      `}
    >
      {icon}
    </button>
  )
}
