import React, { useState, useRef } from 'react'
import { FaCaretRight } from 'react-icons/fa'

interface DropdownButtonProps {
  buttons: {
    icon?: React.ReactNode
    text?: string
    onClick?: () => void
    dropdownItems?: {
      text: string
      onClick?: () => void
    }[]
  }[]
  position?: 'right' | 'left'
  buttonPadding?: string
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  buttons,
  position = 'right',
  buttonPadding,
}) => {
  const [showDropdownItems, setShowDropdownItems] = useState<number | null>(
    null,
  )
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleShowDropdownItems = (index: number) => {
    setShowDropdownItems((prevState) => (prevState === index ? null : index))
  }

  const handleItemClick = (dropdownItemOnClick?: () => void) => {
    if (dropdownItemOnClick) {
      dropdownItemOnClick()
    }
    setShowDropdownItems(null) // Fechar o dropdown após o clique
  }

  return (
    <div
      className={`
        flex
        bg-fichasPay-main-400
        rounded-xs
        w-fit
        py-xs
        sm:py-[10.5px]
        ${buttons.length > 1 && 'divide-x'}
      `}
    >
      {buttons.map((button, index) => {
        const isDropdownItemsExists =
          button.dropdownItems && button.dropdownItems.length > 0

        return (
          <div key={index} className="relative">
            <button
              onBlur={() => setTimeout(() => setShowDropdownItems(null), 150)} // Adicionado timeout para evitar fechamento imediato
              className={`flex items-center gap-xxs ${buttonPadding || 'px-s'}`}
              onClick={(e) => {
                e.preventDefault()
                if (isDropdownItemsExists) {
                  toggleShowDropdownItems(index)
                } else if (button.onClick) {
                  button.onClick()
                }
              }}
            >
              <div>{button.icon}</div>
              <p className="text-BODY-XM font-Bold text-grey-900 sm:hidden">
                {button.text}
              </p>
              {isDropdownItemsExists && <FaCaretRight size={8} />}
            </button>

            {showDropdownItems === index && isDropdownItemsExists && (
              <div
                ref={dropdownRef}
                className={`
                  absolute z-10 flex flex-col items-start mt-xs rounded-xs bg-grey-300 shadow-DShadow-Special-X border-[1px] border-solid border-grey-400 min-w-max w-full
                  ${position === 'right' ? 'left-0' : 'right-0'}
                `}
              >
                {button.dropdownItems?.map((dropdownItem, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={(e) => {
                      e.preventDefault()
                      handleItemClick(dropdownItem.onClick)
                    }}
                    className="text-BODY-XM text-grey-700 font-Regular cursor-pointer px-xs py-[10px] w-full text-start"
                  >
                    {dropdownItem.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
