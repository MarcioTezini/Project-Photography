import React from 'react'

interface IMenuTitleProps {
  icon?: React.ReactNode
  title: string
  isOpenMenu: boolean
  isActive: boolean
  onCLick?: () => void
}

export const MenuTitle: React.FC<IMenuTitleProps> = ({
  icon,
  title,
  isOpenMenu,
  isActive,
  onCLick,
}) => {
  return (
    <div className="flex items-center space-x-s" onClick={onCLick}>
      <div
        className={`
          w-[22px] 
          h-[22px]
          ${isActive && 'text-fichasPay-main-400'}
        `}
      >
        {icon}
      </div>
      {isOpenMenu && (
        <p
          className={`
            text-BODY-XM 
            font-Semibold 
            uppercase
            ${isActive ? 'text-fichasPay-main-400' : ''}
          `}
        >
          {title}
        </p>
      )}
    </div>
  )
}
