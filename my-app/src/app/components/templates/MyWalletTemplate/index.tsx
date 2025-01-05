'use client'

import Button from '@/components/atoms/Button'
import Textfield from '@/components/atoms/Textfield'
import { ContentPage } from '@/components/molecules/ContentPage'
import DashboardFilter from '@/components/molecules/DashboardFilter'
import Dialog from '@/components/molecules/Dialog'
import FormWithDrawalMyWallet from '@/components/organisms/FormWithDrawalMyWallet'
import { Deposit } from '@/components/organisms/MyWallet/Deposit'
import { TableMyWallet } from '@/components/organisms/TableMyWallet'
import { useDebounce } from '@/hooks/useDebounce'
import { useClientStore } from '@/stores/ClientStore'
import { useMyWalletStore } from '@/stores/MyWallet'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FiSearch, FiSettings } from 'react-icons/fi'
import { PiHandDeposit, PiHandWithdraw } from 'react-icons/pi'
import PanelTemplate from '../PanelTemplate'

const MyWalletTemplate = () => {
  const t = useTranslations()
  const {
    loadAgents,
    setSelectedId,
    currentSorting,
    rowCount,
    setOpenAddCarouselDialog,
    initialDate,
    setInitialDate,
    currentPagination,
    finalDate,
    MyWalletData,
    setFinalDate,
    searchText,
    setSearchText,
  } = useMyWalletStore()
  const [openDeposit, setOpenDeposit] = useState(false)
  const [openFormCarousel, setOpenFormCarousel] = useState(false)
  const { selectedClient } = useClientStore()
  const handleClose = () => {
    setOpenFormCarousel(false)
  }
  const isFirstRender = useRef(true)

  const [tableKey, setTableKey] = useState(Date.now())

  const refreshData = useCallback(() => {
    setTableKey(Date.now())
  }, [])
  const handleOpenFormWithdrawal = () => {
    setOpenFormCarousel(true)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const handleDateChange = (startDate: string, endDate: string) => {
    setInitialDate(startDate)
    setFinalDate(endDate)
  }

  const loadTransactionsWithDebounce = useDebounce(() => {
    loadAgents(currentPagination, currentSorting)
  }, 1000)

  useEffect(() => {
    if (isFirstRender.current) {
      if (selectedClient !== null) {
        isFirstRender.current = false // Marca como já renderizado
      }
      return // Sai do efeito sem chamar a função
    }

    loadTransactionsWithDebounce()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDate, finalDate, searchText, currentSorting, selectedClient])

  return (
    <PanelTemplate
      title={'CONFIGURAÇÕES'}
      icon={<FiSettings className="h-m w-m" />}
    >
      <div className="pb-xxxm">
        <ContentPage
          pageName={'Minha Carteira'}
          pageButton={
            <div className="flex gap-xs">
              <Button
                variant="primary"
                preIcon={<PiHandDeposit width={18} height={18} />}
                width={119}
                onClick={() => setOpenDeposit(true)}
                showIconOnly
              >
                {'Depositar'}
              </Button>
              <Button
                variant="outline"
                preIcon={<PiHandWithdraw width={18} height={18} />}
                width={93}
                showIconOnly
                onClick={handleOpenFormWithdrawal}
              >
                {'Sacar'}
              </Button>
            </div>
          }
        >
          <div className="flex items-end justify-between sm:flex-col sm:gap-s sm:items-start">
            <div>
              <div className="flex gap-xs mt-xm">
                <DashboardFilter
                  buttonText="Filtrar"
                  onDateChange={handleDateChange}
                  selectedClient={selectedClient}
                />
              </div>
            </div>
            <div className="text-BODY-XM font-Regular text-grey-700 w-full max-w-[312px] sm:max-w-full">
              <Textfield
                name="search-clients"
                placeholder={t('Panel.MyClients.searchPlaceholder')}
                icon={<FiSearch size={24} className="text-grey-600" />}
                onChange={handleSearch}
                value={searchText}
              />
            </div>
          </div>
          <div className="mt-s">
            <TableMyWallet
              key={tableKey}
              data={MyWalletData}
              rowCount={rowCount}
              onPaginationChange={loadAgents}
              reloadData={loadTransactionsWithDebounce}
              setSelectedId={setSelectedId}
              initialPagination={currentPagination}
              initialSorting={currentSorting}
            />
          </div>
        </ContentPage>
      </div>
      <Dialog
        position="aside"
        title={t('Panel.MyWallet.formWithdrawal.Withdraw')}
        className="w-[531px]"
        open={openFormCarousel}
        onClose={handleClose}
      >
        <FormWithDrawalMyWallet
          onClose={handleClose}
          refreshData={refreshData}
          setOpenFormCarousel={setOpenFormCarousel}
          setOpenAddAgentDialog={setOpenAddCarouselDialog}
        />
      </Dialog>
      <Dialog
        title="Depositar"
        open={openDeposit}
        onClose={() => setOpenDeposit(false)}
        position="aside"
        className="min-w-[532px] sm:min-w-full sm:h-[400px]"
      >
        <Deposit
          onCancel={() => setOpenDeposit(false)}
          onLoadTransactions={loadAgents}
        />
      </Dialog>
    </PanelTemplate>
  )
}

export default MyWalletTemplate
