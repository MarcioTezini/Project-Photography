'use client'

import Textfield from '@/components/atoms/Textfield'
import { ContentPage } from '@/components/molecules/ContentPage'
import { useDebounce } from '@/hooks/useDebounce'
import { useClientStore } from '@/stores/ClientStore'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FiHome, FiPlusCircle, FiSearch } from 'react-icons/fi'
import PanelTemplate from '../PanelTemplate'
import { useChipStore } from '@/stores/ChipStore'
import { TableChipsManagement } from '@/components/organisms/TableChipsManagement'
import Button from '@/components/atoms/Button'
import Dialog from '@/components/molecules/Dialog'
import { FormManagementChip } from '@/components/organisms/FormManagementChip'

const DashboardFilter = dynamic(
  () => import('@/components/molecules/DashboardFilter'),
  {
    ssr: false,
  },
)

const ChipsManagementTemplate = () => {
  const t = useTranslations()
  const {
    loadTransactions,
    currentSorting,
    initialDate,
    rowCount,
    setInitialDate,
    finalDate,
    ChipsData,
    setFinalDate,
    searchText,
    currentPagination,
    setSearchText,
  } = useChipStore()
  const { selectedClient } = useClientStore()
  const [openManagementChips, setOpenManagementChips] = useState(false)
  const isFirstRender = useRef(true)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const handleDateChange = (startDate: string, endDate: string) => {
    setInitialDate(startDate)
    setFinalDate(endDate)
  }
  const [tableKey, setTableKey] = useState(Date.now())
  const refreshData = useCallback(() => {
    setTableKey(Date.now())
  }, [])

  const handleOpenFormManagementChips = () => {
    setOpenManagementChips(true)
  }

  const loadTransactionsWithDebounce = useDebounce(() => {
    loadTransactions(currentPagination, currentSorting)
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
      title={t('Panel.ChipsManagement.title')}
      icon={<FiHome className="h-m w-m" />}
    >
      <div className="pb-xxxm">
        <ContentPage
          pageName={t('Panel.ChipsManagement.pageName')}
          pageButton={
            <Button
              variant="outline"
              addIcon={<FiPlusCircle width={18} height={18} />}
              width={93}
              showIconOnly
              onClick={handleOpenFormManagementChips}
            >
              {t('Panel.ManagingClubs.btnManagement')}
            </Button>
          }
        >
          <div className="flex items-end justify-between sm:flex-col sm:gap-s sm:items-start">
            <div>
              <div className="flex gap-xs mt-xm sm:flex-row">
                <DashboardFilter
                  buttonText={t('Panel.ChipsManagement.filter')}
                  onDateChange={handleDateChange}
                  selectedClient={selectedClient}
                />
              </div>
            </div>
            <div className="text-BODY-XM font-Regular text-grey-700 w-full max-w-[312px] sm:max-w-full">
              <Textfield
                name="search-chips"
                placeholder={t('Panel.ChipsManagement.searchPlaceholder')}
                icon={<FiSearch size={24} className="text-grey-600" />}
                onChange={handleSearch}
                value={searchText}
              />
            </div>
          </div>
          <div className="mt-s">
            <TableChipsManagement
              key={tableKey}
              data={ChipsData}
              rowCount={rowCount}
              onPaginationChange={loadTransactions}
              reloadData={loadTransactionsWithDebounce}
              initialPagination={currentPagination}
              initialSorting={currentSorting}
            />
          </div>
        </ContentPage>
      </div>
      <Dialog
        title={t('Panel.ManagingClubs.title')}
        open={openManagementChips}
        onClose={() => setOpenManagementChips(false)}
        position="aside"
        className="min-w-[532px] sm:min-w-full sm:!h-[599px]"
      >
        <FormManagementChip
          onClose={() => setOpenManagementChips(false)}
          refreshData={refreshData}
        />
      </Dialog>
    </PanelTemplate>
  )
}

export default ChipsManagementTemplate
