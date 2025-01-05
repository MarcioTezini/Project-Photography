import React from 'react'

interface IMenuSubtitleProps {
  icon?: React.ReactNode
  label?: string
  title: string
  isOpenMenu: boolean
  isActive: boolean
}

export const MenuSubtitle: React.FC<IMenuSubtitleProps> = ({
  icon,
  label,
  title,
  isOpenMenu,
  isActive,
}) => {
  return (
    <div className="flex items-center gap-s ">
      {icon && (
        <div
          className={`w-[22px] h-[22px] ${isActive ? 'text-fichasPay-main-400' : ''}`}
        >
          {icon}
        </div>
      )}
      {label && (
        <span
          className={`min-w-[22px] uppercase ${isActive ? 'text-fichasPay-main-400' : ''}`}
        >
          {label}
        </span>
      )}
      {isOpenMenu && (
        <span
          className={`min-w-[22px] ${isActive ? 'text-fichasPay-main-400' : ''}`}
        >
          {title}
        </span>
      )}
    </div>
  )
}
