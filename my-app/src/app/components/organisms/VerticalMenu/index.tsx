/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useMediaQuery } from 'react-responsive'
import dynamic from 'next/dynamic'
import { FiChevronLeft } from 'react-icons/fi'
import { CgMenuLeftAlt } from 'react-icons/cg'
import { AiOutlineClose } from 'react-icons/ai'
import Image from 'next/image'
import companyIcon from '../../../../public/images/logos/Logo-FichasPay.png'
import favIcon from '../../../../public/images/logos/favicon.png'
import { useRouter, usePathname } from 'next/navigation'
import SaveChangesDialog from '../SaveChangesDialog'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { useLocale } from 'next-intl'
import { useMe } from '@/stores/Me'
import { motion } from 'framer-motion'
import { logout } from '@/services/auth/login'
import MenuItem from '@/components/molecules/MenuItem'
import { UserMenu } from '@/components/molecules/UserMenu'
import { useTranslatedMenuData } from '@/hooks/useTranslatedMenuData'
import './styles.css'
import { useFormFilterStore } from '@/stores/FormFilterPropsStore'

const MediaQuery = dynamic(() => import('react-responsive'), {
  ssr: false,
})

interface IDropdowns {
  [key: string]: boolean
}

const MenuVertical = () => {
  const [isOpen, setIsOpen] = useState(false) // Estado de abertura/fechamento do menu
  const [dropdowns, setDropdowns] = useState<IDropdowns>({})
  const [isPanelRoute, setIsPanelRoute] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string>('') // Estado do menu ativo
  const isSmallScreen = useMediaQuery({ query: '(max-width: 679px)' })
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { me, permissions } = useMe() // Dados do usuário
  const { hasUnsavedChanges, setIsSaveChangesDialogOpen, setTargetPage } =
    useSaveChangesDialogStore()
  const { resetFormData } = useFormFilterStore()

  const menuData = useTranslatedMenuData() // Pega o menu com as traduções

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const toggleDropdown = (section: string) => {
    setDropdowns((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }))
  }

  const handleMenuClick = useCallback(
    (section: string, event: React.MouseEvent, href?: string) => {
      event.preventDefault()
      if (hasUnsavedChanges && href) {
        setIsSaveChangesDialogOpen(true)
        setTargetPage(`/${locale}${href}`)
      } else {
        if (!isOpen) toggleMenu()

        // Defina o activeMenu para o menu de usuário ou para os menuItems
        if (href && section !== 'Encerrar Sessão') {
          setActiveMenu(section)
          resetFormData()
          router.push(`/${locale}${href}`)
        }

        if (section === 'Encerrar Sessão') {
          logout()
        }
      }
    },
    [hasUnsavedChanges, isOpen, locale, router, toggleMenu, setActiveMenu],
  )

  useEffect(() => {
    const findActiveMenu = () => {
      // Encontra o menu principal ou userMenu baseado na rota
      const activeMenuItem =
        menuData.menuItems.find((menuItem) => {
          if (menuItem.dropdownItems) {
            return menuItem.dropdownItems.some((dropdownItem) => {
              return dropdownItem.href && pathname.includes(dropdownItem.href)
            })
          }
          return pathname.includes(menuItem.href)
        }) ||
        menuData.userMenu.dropdownItems.find((dropdownItem) =>
          pathname.includes(dropdownItem.href),
        ) // Verifica também no userMenu

      // Define o menu ativo com base no item encontrado
      if (activeMenuItem) {
        setActiveMenu(activeMenuItem.title) // Define activeMenu para o nome ou título
      } else {
        setActiveMenu('') // Reseta se não encontrar
      }
    }

    findActiveMenu()
  }, [pathname, menuData])

  const renderLogo = () => {
    if (isOpen) {
      return (
        <Image
          src={companyIcon}
          width={150}
          height={30}
          alt="Logo da Empresa"
        />
      )
    }
    return (
      <Image
        className={`${!isOpen && 'cursor-pointer m-auto'}`}
        src={favIcon}
        width={30}
        height={30}
        alt="Favicon"
      />
    )
  }

  const checkRouteExists = (href: string) => {
    if (permissions) {
      return permissions.includes(href)
    }
  }

  useEffect(() => {
    if (
      pathname.includes('/painel') &&
      !pathname.includes('/painel/login') &&
      !pathname.includes('/painel/employee/confirm') &&
      me
    ) {
      setIsPanelRoute(true)
    } else {
      setIsPanelRoute(false)
    }
  }, [me, permissions, pathname])

  useEffect(() => {
    setIsOpen(!isSmallScreen)
  }, [isSmallScreen])

  return (
    <>
      {isPanelRoute && (
        <div
          className={`md:relative sm:fixed ${isOpen ? 'sm:w-screen' : ''} h-screen z-10 flex`}
        >
          <MediaQuery maxWidth={679}>
            <div
              className="absolute bg-grey-900 w-fit h-fit rounded-xxl m-xs"
              onClick={toggleMenu}
            >
              <CgMenuLeftAlt size={28} className="text-grey-400 m-xs" />
            </div>
          </MediaQuery>

          <motion.aside
            className={`${
              !isOpen ? 'sm:hidden' : 'w-[272px]'
            } flex flex-col text-grey-500 bg-grey-900 text-BODY-XM h-screen transition-all duration-300 ease-in-out relative`}
            initial={{ x: '-100%' }} // Menu começa fora da tela (à esquerda)
            animate={!isSmallScreen ? { x: isOpen ? 0 : '0' } : { x: 0 }} // Move o menu para dentro da tela se `isOpen` for true
            exit={{ x: '-100%' }} // Sai para fora da tela (à esquerda) quando fechado
            transition={{ duration: 0.3, ease: 'easeOut' }} // Controle de transição suave
          >
            <div
              className="flex mt-xm items-center justify-between px-s py-xxs"
              onClick={isOpen ? undefined : toggleMenu}
            >
              {renderLogo()}
              {isOpen && (
                <MediaQuery minWidth={679}>
                  <button
                    className="bg-grey-800 hover:bg-grey-700 focus:outline-none p-xxs rounded-xxl"
                    onClick={toggleMenu}
                    aria-label="Fechar menu"
                  >
                    <FiChevronLeft size={22} />
                  </button>
                </MediaQuery>
              )}
            </div>
            <UserMenu
              user={{
                id: me?.user?.id,
                name: me?.user?.name,
                image: me?.user?.photo,
              }}
              dropdownItems={menuData.userMenu.dropdownItems}
              handleMenuClick={handleMenuClick}
              isOpenMenu={isOpen}
              activeMenu={activeMenu}
            />
            <ul
              className={`flex flex-col gap-m p-s flex-grow overflow-y-auto ${
                !isOpen && 'items-center'
              }`}
            >
              {/* Renderização dos itens do menu com base no estado */}
              {menuData.menuItems.map((item, index) => {
                const hasValidHref = item.href
                  ? checkRouteExists(item.href)
                  : false
                const hasValidDropdownItems = item.dropdownItems
                  ? item.dropdownItems.some((dropdownItem) =>
                      checkRouteExists(dropdownItem.href),
                    )
                  : false

                if (!hasValidHref && !hasValidDropdownItems) {
                  return null
                }

                const isActive = activeMenu === item.title
                return (
                  <li key={index}>
                    <MenuItem
                      currentPath={pathname}
                      title={item.title}
                      isOpenMenu={isOpen}
                      isActive={isActive}
                      href={item.href ?? ''}
                      dropdownItems={item.dropdownItems?.filter(
                        (dropdownItem) => checkRouteExists(dropdownItem.href),
                      )}
                      onActiveMenu={handleMenuClick}
                      toggleDropdown={toggleDropdown}
                      icon={item.icon}
                      dropdowns={dropdowns}
                    />
                  </li>
                )
              })}
            </ul>
            {isOpen && (
              <span className="text-center text-LABEL-L font-Semibold mb-m">
                © {new Date().getFullYear()}, SAYPLUS TECHNOLOGY LTDA
              </span>
            )}
          </motion.aside>

          {isOpen && (
            <MediaQuery maxWidth={679}>
              <div
                className="bg-grey-900 w-fit h-fit rounded-xxl m-xs ml-s"
                onClick={toggleMenu}
              >
                <AiOutlineClose size={28} className="text-grey-400 m-xs" />
              </div>
            </MediaQuery>
          )}

          <SaveChangesDialog />
        </div>
      )}
    </>
  )
}

export default MenuVertical
