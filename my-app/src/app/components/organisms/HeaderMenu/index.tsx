'use client'

import Button from '@/components/atoms/Button'
import { useHomeStore } from '@/stores/HomeStore'
import { useSignupStore } from '@/stores/SignupStore'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import Dialog from '@/components/molecules/Dialog'
import FormLinkNewAccount from '../FormLinkNewAccount'
import React, { useMemo } from 'react'
import MediaQuery from 'react-responsive'
import LanguageSelector from '../LanguageSelector'
import { UserInfoMenu } from '../UserInfoMenu'
import { useBuyDiamondsDialogStore } from '@/stores/BuyDiamondsDialogStore'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'
import useWithdrawalDialogStore from '@/stores/WithdrawalDialogStore'
import WithdrawalDialog from '../WithdrawalDialog'
import useDepositDialogStore from '@/stores/DepositDialogStore'

export function HeaderMenu() {
  const t = useTranslations('Home')
  const { isLoggedIn } = useHomeStore()
  const { onOpenForm } = useSignupStore()
  const { configs, customerData } = useCustomerStore()
  const { setOpen } = useBuyDiamondsDialogStore()
  const { setOpenDepositDialog } = useDepositDialogStore()
  const { setWithdrawalDialog, openWithdrawalDialog } =
    useWithdrawalDialogStore()
  const {
    openLoginDialog,
    setOpenLoginDialog,
    setOpenFormLogin,
    setOpenHomeLoginDialog,
  } = useHomeLoginDialogStore()
  const handleCloseAddAccountDialog = () => {
    setOpenLoginDialog(false)
  }

  const dynamicLinks = useMemo(() => {
    const menus = [
      configs?.content?.poker?.visible
        ? {
            name: t('headerMenu.SupremaPoker'),
            order: configs?.content?.poker?.order,
            href: '#poker',
          }
        : null,
      configs?.content?.cacheta?.visible
        ? {
            name: t('headerMenu.CachetaLeague'),
            order: configs?.content?.cacheta?.order,
            href: '#cacheta',
          }
        : null,
      configs?.content?.buyDiamonds?.visible
        ? {
            name: t('headerMenu.AdquirirDiamantes'),
            order: configs?.content?.buyDiamonds?.order,
            href: '',
            onClick: () => setOpen(true),
          }
        : null,
    ]

    return menus
      .filter((menu) => menu !== null)
      .sort((a, b) => a!.order - b!.order)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configs, t])

  const backgroundClass =
    configs?.content?.menuBackgroundConfig === 'Gradiente'
      ? 'bg-header-menu-gradient backdrop-blur-[5px] fixed'
      : 'bg-fichasPay-secondary-400 relative'

  return (
    <>
      <Dialog
        isDarkMode
        position="aside"
        title={'Vincular contas'}
        open={openLoginDialog}
        onClose={handleCloseAddAccountDialog}
        className="w-[531px] bg-grey-900 text-grey-300 sm:h-[492px]"
      >
        <FormLinkNewAccount
          onClose={handleCloseAddAccountDialog}
          setOpenFormLogin={setOpenFormLogin}
          refreshData={() => {}}
        />
      </Dialog>
      <div
        className={`flex z-10 justify-between items-center h-auto shrink-0 w-full px-xl py-xm ${backgroundClass}`}
      >
        <MediaQuery minWidth={1281}>
          {configs?.logos?.logo && (
            <Image
              src={configs?.logos?.logo}
              width={191}
              height={33}
              alt="Logo da Marca"
            />
          )}
        </MediaQuery>
        <MediaQuery maxWidth={1280}>
          {configs?.logos?.logoMobile && (
            <Image
              src={configs?.logos?.logoMobile}
              width={32}
              height={32}
              alt="Logo da Marca"
            />
          )}
        </MediaQuery>
        <div className="flex justify-end items-center gap-s">
          {configs?.content?.hasAbout && (
            <Link
              href="#about"
              className="text-grey-300 text-BODY-XM font-Medium"
            >
              {t('headerMenu.Sobre')}
            </Link>
          )}
          {dynamicLinks.map((link, index) => (
            <Link
              key={index}
              href={link!.href}
              className="text-grey-300 text-BODY-XM font-Medium"
              onClick={link.onClick}
            >
              {link!.name}
            </Link>
          ))}
          {customerData?.name === 'Big Shark Games' && (
            <Link
              href="https://roletapremiada.bigsharkgames.com.br/"
              className="text-grey-300 text-BODY-XM font-Medium"
              target="_blank"
            >
              {t('headerMenu.RoletaPremiada')}
            </Link>
          )}
          {isLoggedIn && (
            <button
              onClick={() => setOpenLoginDialog(true)}
              className="text-grey-300 text-BODY-XM font-Medium"
            >
              {t('headerMenu.VincularContas')}
            </button>
          )}
          {isLoggedIn ? (
            <Button
              variant="outline"
              isBrandButton
              onClick={() => {
                setOpenDepositDialog(true)
              }}
            >
              {t('headerMenu.Depositar')}
            </Button>
          ) : (
            <Button variant="outline" isBrandButton onClick={onOpenForm}>
              {t('headerMenu.CriarConta')}
            </Button>
          )}
          {isLoggedIn ? (
            <Button
              onClick={() => {
                setWithdrawalDialog(true)
              }}
              isBrandButton
            >
              {t('headerMenu.Sacar')}
            </Button>
          ) : (
            <Button onClick={() => setOpenHomeLoginDialog(true)} isBrandButton>
              {t('headerMenu.Signin')}
            </Button>
          )}
          {isLoggedIn && <UserInfoMenu />}
          <LanguageSelector />
          {openWithdrawalDialog && <WithdrawalDialog />}
        </div>
      </div>
    </>
  )
}
