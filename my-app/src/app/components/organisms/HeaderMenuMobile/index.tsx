'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import collapseIcon from '../../../../public/images/union.svg'
import { useHomeStore } from '@/stores/HomeStore'
import { UserInfoMenu } from '../UserInfoMenu'
import LanguageSelector from '../LanguageSelector'
import { useTranslations } from 'next-intl'
import Button from '@/components/atoms/Button'
import Link from 'next/link'
import { useCustomerStore } from '@/stores/useCustomerStore'
import Dialog from '@/components/molecules/Dialog'
import Divider from '@/components/atoms/Divider'
import { useBuyDiamondsDialogStore } from '@/stores/BuyDiamondsDialogStore'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'
import FormLinkNewAccount from '../FormLinkNewAccount'
import useWithdrawalDialogStore from '@/stores/WithdrawalDialogStore'
import { useSignupStore } from '@/stores/SignupStore'
import useDepositDialogStore from '@/stores/DepositDialogStore'

export function HeaderMenuMobile() {
  const { setWithdrawalDialog } = useWithdrawalDialogStore()
  const t = useTranslations('Home')
  const { isLoggedIn } = useHomeStore()
  const { configs, customerData } = useCustomerStore()
  const { setOpen } = useBuyDiamondsDialogStore()
  const { setOpenDepositDialog } = useDepositDialogStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const {
    setOpenHomeLoginDialog,
    setOpenLoginDialog,
    openLoginDialog,
    setOpenFormLogin,
  } = useHomeLoginDialogStore()
  const { onOpenForm } = useSignupStore()

  const handleCloseAddAccountDialogMobile = () => {
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
      ? 'backdrop-blur-[7.5px] fixed'
      : 'bg-fichasPay-secondary-400 relative'

  return (
    <>
      <div
        className={`flex z-10 max-w-[1080px] w-full p-s justify-between items-center shrink-0 ${backgroundClass}`}
      >
        <Dialog
          isDarkMode
          position="aside"
          title={'Vincular contas'}
          open={openLoginDialog}
          onClose={handleCloseAddAccountDialogMobile}
          className="w-[531px] sm:!h-[540px] bg-grey-900 text-grey-300"
        >
          <FormLinkNewAccount
            onClose={handleCloseAddAccountDialogMobile}
            setOpenFormLogin={setOpenFormLogin}
            refreshData={() => {}}
          />
        </Dialog>
        <div>
          {configs?.logos?.logoMobile && (
            <Image
              src={configs?.logos?.logoMobile}
              width={32}
              height={30}
              alt="Logo da Marca"
            />
          )}
        </div>
        <div className="flex justify-end items-center gap-s flex-shrink-0">
          {!isDialogOpen && (
            <>
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
                <Button
                  onClick={() => setOpenHomeLoginDialog(true)}
                  isBrandButton
                >
                  {t('headerMenu.Signin')}
                </Button>
              )}
            </>
          )}
          {isLoggedIn && <UserInfoMenu />}
          <Image
            src={collapseIcon}
            width={20}
            height={20}
            alt=""
            onClick={() => setIsDialogOpen(!isDialogOpen)}
          />
        </div>
      </div>
      <Dialog
        position="aside"
        open={isDialogOpen}
        className="w-[360px] bg-grey-900"
        onClose={() => setIsDialogOpen(false)}
        maxHeightInSm
        removeHeaderPaddingX
        alternativeCloseIconColor
        headerContent={
          configs?.logos?.logo && (
            <Image
              src={configs?.logos?.logo}
              width={191}
              height={33}
              alt="Logo da Marca"
              className="ml-s"
            />
          )
        }
      >
        <div className="flex w-full h-screen pt-s flex-col items-center gap-xm flex-shrink-0 bg-grey-900">
          <div className="flex flex-col items-center self-stretch">
            {configs?.content?.hasAbout && (
              <div className="flex h-xl gap-s ml-s self-stretch items-center">
                <Link
                  href="#about"
                  className="text-grey-300 text-center text-BODY-XM font-Medium"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t('headerMenu.Sobre')}
                </Link>
              </div>
            )}
            <Divider className="bg-grey-700" />
            {dynamicLinks.map((link, index) => (
              <>
                <div
                  key={link.name + index}
                  className="flex h-xl self-stretch items-center ml-s my-xs"
                >
                  <Link
                    href={link!.href}
                    className="text-grey-300 text-center text-BODY-XM font-Medium"
                    onClick={() => {
                      if (link.onClick) {
                        link.onClick()
                      }
                      setIsDialogOpen(false)
                    }}
                  >
                    {link!.name}
                  </Link>
                </div>
                <Divider className="bg-grey-700" />
              </>
            ))}
            {customerData?.name === 'Big Shark Games' && (
              <>
                <div className="flex h-xl self-stretch items-center ml-s my-xs">
                  <Link
                    href="https://roletapremiada.bigsharkgames.com.br/"
                    className="text-grey-300 text-BODY-XM font-Medium"
                    target="_blank"
                  >
                    {t('headerMenu.RoletaPremiada')}
                  </Link>
                </div>
                <Divider className="bg-grey-700" />
              </>
            )}
            {isLoggedIn && (
              <>
                <div className="flex h-xl gap-s self-stretch items-center ml-s my-xs">
                  <button
                    onClick={() => setOpenLoginDialog(true)}
                    className="text-grey-300 text-BODY-XM font-Medium"
                  >
                    {t('headerMenu.VincularContas')}
                  </button>
                </div>
                <Divider className="bg-grey-700" />
              </>
            )}
          </div>
          <div className="w-full flex justify-center items-center gap-m md:flex-col sm:flex-col px-xl">
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="lg"
                maxWidth
                isBrandButton
                onClick={() => {
                  setOpenDepositDialog(true)
                }}
              >
                {t('headerMenu.Depositar')}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                maxWidth
                isBrandButton
                onClick={onOpenForm}
              >
                {t('headerMenu.CriarConta')}
              </Button>
            )}

            {isLoggedIn ? (
              <Button
                onClick={() => {
                  setWithdrawalDialog(true)
                }}
                size="lg"
                maxWidth
                isBrandButton
              >
                {t('headerMenu.Sacar')}
              </Button>
            ) : (
              <Button
                onClick={() => setOpenHomeLoginDialog(true)}
                size="lg"
                maxWidth
                isBrandButton
              >
                {t('headerMenu.Signin')}
              </Button>
            )}
          </div>
          <div className="ml-4 sm:ml-10 md:ml-10">
            <LanguageSelector />
          </div>
        </div>
      </Dialog>
    </>
  )
}
