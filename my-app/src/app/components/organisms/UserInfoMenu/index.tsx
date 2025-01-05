import * as Accordion from '@radix-ui/react-accordion'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React, { useEffect, useState } from 'react'
import {
  FiUser,
  FiLock,
  FiMail,
  FiEdit,
  FiLogOut,
  FiMapPin,
} from 'react-icons/fi'
import Image from 'next/image'
import rightArrow from '../../../../public/images/polygons/polygon-1.svg'
import bottomArrow from '../../../../public/images/polygons/polygon-2.svg'
import { useTranslations } from 'next-intl'
import useDialogStore from '@/stores/DialogStore'
import MyDataDialog from '../MyDataDialog'
import { homeLogout } from '@/services/auth/login'
import useLinkedAccountsDialogStore from '@/stores/LinkedAccountsDialog'
import LinkedAccountsDialog from '../LinkedAccountsDialog'
import useTransationDialogStore from '@/stores/TransationDialog'
import TransationDialog from '../TransationDialog'
import { useLoginStore } from '@/stores/LoginStore'
import useChangeEmailDialogStoreDialogStore from '@/stores/DialogChangeEmail'
import ChangeEmailDialog from '../ChangeEmailDialog'
import AddressDialog from '../AddressDialog'
import useAddressDialogStore from '@/stores/AddressDialogStore'

export function UserInfoMenu() {
  const [open, setOpen] = useState(false)
  const { setIsOpenFormResetPassword } = useLoginStore()
  const [openAccordion, setOpenAccordion] = useState(false)
  const { setOpenMyDataDialog, openMyDataDialog } = useDialogStore()
  const { setOpenAddressDialog, openAddressDialog } = useAddressDialogStore()
  const { openChangeEmaillDialog, setOpenChangeEmaillDialog } =
    useChangeEmailDialogStoreDialogStore()
  const { setLinkedAccountsDialog, openLinkedAccountsDialog } =
    useLinkedAccountsDialogStore()
  const { setTransationDialog, openTransationDialog } =
    useTransationDialogStore()
  const t = useTranslations('Home.UserInfoMenu')

  const handleChangeEmailDialog = () => {
    setOpenChangeEmaillDialog(true)
  }

  const handleAccordionChange = (isOpen: boolean) => {
    setOpenAccordion(isOpen)
  }

  const handleOpenLinkedAccountsDialog = () => {
    setLinkedAccountsDialog(true)
  }

  const handleOpenTransactionDialog = () => {
    setTransationDialog(true)
  }

  const handleOpenDialogMyData = () => {
    setOpenMyDataDialog(true)
  }

  const handleOpenDialogAddress = () => {
    setOpenAddressDialog(true)
  }

  useEffect(() => {
    if (open) {
      document.body.style.setProperty('overflow-y', 'auto', 'important')
      document.body.style.setProperty('margin-right', '0', 'important')
    } else {
      document.body.style.removeProperty('overflow-y')
    }
  }, [open])

  return (
    <>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <div className="flex w-xm h-xm p-xxs items-center justify-center gap-[10px] rounded-xxl border-2 border-solid border-fichasPay-main-400 cursor-pointer">
            <FiUser className="h-xm w-xm text-fichasPay-main-400" />
          </div>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="left"
            align="end"
            sideOffset={175}
            className="absolute z-10 top-s flex w-[255px] flex-col justify-center items-end flex-shrink-0 bg-grey-800 rounded-xs shadow-DShadow-Special-X"
          >
            <DropdownMenu.Item
              className="text-grey-300 text-right text-BODY-XM font-Regular p-s hover:bg-grey-700 w-full hover:font-Bold hover:cursor-pointer hover:rounded-t-xs"
              onSelect={handleOpenLinkedAccountsDialog}
            >
              <span>{t('ContasVinculadas')}</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="text-grey-300 text-right text-BODY-XM font-Regular p-s hover:bg-grey-700 w-full hover:font-Bold hover:cursor-pointer"
              onSelect={handleOpenTransactionDialog}
            >
              <span>{t('HistoricoTransacoes')}</span>
            </DropdownMenu.Item>

            <Accordion.Root
              type="single"
              collapsible
              className="w-full"
              onValueChange={(value) => handleAccordionChange(!!value)}
            >
              <Accordion.Item
                value="infoDaConta"
                className="border-b border-grey-700"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="text-grey-300 text-right text-BODY-XM font-Regular p-s hover:bg-grey-700 w-full flex justify-end items-center hover:font-Bold hover:cursor-pointer gap-[10px] focus:bg-grey-800">
                    <span>{t('InfoConta')}</span>
                    <Image
                      src={openAccordion ? bottomArrow : rightArrow}
                      alt=""
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="bg-grey-800 flex flex-col">
                  <DropdownMenu.Item
                    className="flex items-center justify-end text-grey-300 text-right text-BODY-XM font-Regular p-s hover:bg-grey-700 w-full hover:font-Bold hover:cursor-pointer gap-s"
                    onSelect={handleOpenDialogMyData}
                  >
                    <span>{t('MeusDados')}</span>
                    <FiEdit className="w-[20px] h-[20px] text-grey-300" />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex items-center justify-end text-grey-300 text-right text-BODY-XM font-Regular p-s hover:bg-grey-700 w-full hover:font-Bold hover:cursor-pointer gap-s"
                    onSelect={handleOpenDialogAddress}
                  >
                    <span>{t('Endereco')}</span>
                    <FiMapPin className="w-[20px] h-[20px] text-grey-300" />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex items-center justify-end text-grey-300 text-right text-BODY-XM font-Regular p-s hover:bg-grey-700 w-full hover:font-Bold hover:cursor-pointer gap-s"
                    onSelect={() => setIsOpenFormResetPassword(true)}
                  >
                    <span>{t('Senha')}</span>
                    <FiLock className="w-[20px] h-[20px] text-grey-300" />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex items-center justify-end text-grey-300 text-right text-BODY-XM font-Regular p-s hover:bg-grey-700 w-full hover:font-Bold hover:cursor-pointer gap-s"
                    onSelect={handleChangeEmailDialog}
                  >
                    <span>{t('Email')}</span>
                    <FiMail className="w-[20px] h-[20px] text-grey-300" />
                  </DropdownMenu.Item>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>

            <DropdownMenu.Item
              className="flex items-center justify-end text-grey-300 text-right text-BODY-XM font-Regular p-s hover:bg-grey-700 w-full hover:font-Bold hover:cursor-pointer hover:rounded-b-xs gap-s"
              onSelect={() => homeLogout()}
            >
              <span>{t('Sair')}</span>
              <FiLogOut className="w-[20px] h-[20px] text-grey-300" />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {openMyDataDialog && <MyDataDialog />}
      {openAddressDialog && <AddressDialog />}
      {openLinkedAccountsDialog && <LinkedAccountsDialog />}
      {openTransationDialog && <TransationDialog />}
      {openChangeEmaillDialog && <ChangeEmailDialog />}
    </>
  )
}
