import React from 'react'
import { useRouter } from 'next/navigation'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import { MenuTitle } from '@/components/molecules/MenuText/Title'
import { MenuSubtitle } from '../MenuText/Subtitle'
import { useLocale } from 'next-intl'

interface IDropdowns {
  [key: string]: boolean
}

interface IMenuItemProps {
  title: string
  isOpenMenu: boolean
  isActive: boolean
  href: string
  dropdowns: IDropdowns
  dropdownItems?: { name: string; href: string; label?: string }[]
  icon?: React.ReactNode
  onActiveMenu: (title: string, event: React.MouseEvent, href?: string) => void
  toggleDropdown: (section: string) => void
  currentPath: string
}

const MenuItem = ({
  title,
  isOpenMenu,
  isActive,
  href,
  dropdownItems,
  dropdowns,
  icon,
  onActiveMenu,
  toggleDropdown,
  currentPath,
}: IMenuItemProps) => {
  const router = useRouter()
  const locale = useLocale() // Pega o locale atual

  const isOpenDropdown = dropdowns[title.toLowerCase()]

  const renderChevrons = () => {
    if (dropdownItems && dropdownItems.length > 0) {
      if (isOpenDropdown) {
        return <FiChevronUp size={20} />
      }
      return <FiChevronDown size={20} />
    }
    return <></>
  }

  const handleToggleDropdown = (event: React.MouseEvent) => {
    event.preventDefault()

    if (dropdownItems && dropdownItems.length > 0) {
      toggleDropdown(title.toLowerCase())
    } else {
      // Redireciona para a rota com o locale atual
      router.push(`/${locale}${href}`)
    }
  }

  return (
    <>
      <a
        className="w-full text-left flex justify-between items-center transition-all duration-300 cursor-pointer"
        onClick={handleToggleDropdown}
        href={`/${locale}${href}`} // Inclui o locale na URL do link
      >
        <MenuTitle
          icon={icon}
          title={title}
          isOpenMenu={isOpenMenu}
          isActive={isActive}
        />
        {isOpenMenu && renderChevrons()}
      </a>

      {isOpenDropdown && (
        <div className="flex flex-col gap-s mt-s">
          {dropdownItems?.map((dropdownItem, index) => {
            return (
              <a
                key={index}
                href={`/${locale}${dropdownItem.href}`} // Inclui o locale no redirecionamento do dropdown
                className="text-BODY-S font-Regular"
                onClick={(event) => {
                  event.preventDefault()
                  onActiveMenu(dropdownItem.name, event, dropdownItem.href)
                }}
              >
                <MenuSubtitle
                  label={dropdownItem.label}
                  title={dropdownItem.name}
                  isActive={currentPath.includes(dropdownItem.href)}
                  isOpenMenu={isOpenMenu}
                />
              </a>
            )
          })}
        </div>
      )}
    </>
  )
}

export default MenuItem
