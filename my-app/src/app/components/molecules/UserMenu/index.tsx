import Image from 'next/image'
import React, { useState } from 'react'
import { MenuSubtitle } from '../MenuText/Subtitle'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface IDropdownItem {
  title: string
  href: string
  label?: string
  icon?: React.ReactNode
}

interface IUserMenuProps {
  user: {
    id: string | number
    name: string
    image: string
  }
  dropdownItems: IDropdownItem[]
  isOpenMenu: boolean
  activeMenu: string
  handleMenuClick: (
    section: string,
    event: React.MouseEvent,
    href?: string,
  ) => void
}

export const UserMenu: React.FC<IUserMenuProps> = ({
  user,
  dropdownItems,
  activeMenu,
  isOpenMenu,
  handleMenuClick,
}) => {
  const [openDropdown, setOpenDropdown] = useState(false)

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown)
  }

  const renderChevrons = () => {
    if (dropdownItems && dropdownItems.length > 0) {
      if (openDropdown) {
        return <FiChevronUp size={20} />
      }
      return <FiChevronDown size={20} />
    }
    return <></>
  }

  return (
    <div
      className={`
        py-m 
        m-s 
        border-y 
        border-grey-700 
        flex 
        flex-col
        ${!isOpenMenu && 'items-center'} 
      `}
    >
      <button className="transition-all duration-300" onClick={toggleDropdown}>
        <div className="flex items-center justify-between w-full gap-xs">
          <div className="w-xm h-xm rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={user.image}
              width={100}
              height={100}
              alt="Profile Picture"
            />
          </div>
          {isOpenMenu && (
            <span
              className={`
              text-BODY-S 
              text-grey-300
              overflow-hidden 
              overflow-ellipsis 
              whitespace-nowrap 
              max-w-[150px]
              uppercase
              text-left
              ${!isOpenMenu && 'opacity-0 transition-opacity duration-300'}
              `}
            >
              {user.name}
            </span>
          )}
          {isOpenMenu && renderChevrons()}
        </div>
      </button>

      {openDropdown && (
        <ul
          className={`
            flex 
            flex-col 
            gap-s 
            mt-s 
            transition-all 
            duration-300
            ${!isOpenMenu && 'items-center'}
          `}
        >
          {dropdownItems.map((dropdownItem, index) => {
            const isActive = activeMenu === dropdownItem.title
            return (
              <li key={index}>
                <a
                  href={dropdownItem.href}
                  className="block text-BODY-XM"
                  onClick={(event) =>
                    handleMenuClick(
                      dropdownItem.title,
                      event,
                      dropdownItem.href,
                    )
                  }
                >
                  <MenuSubtitle
                    icon={dropdownItem.icon}
                    label={dropdownItem.label}
                    title={dropdownItem.title}
                    isOpenMenu={isOpenMenu}
                    isActive={isActive}
                  />
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
