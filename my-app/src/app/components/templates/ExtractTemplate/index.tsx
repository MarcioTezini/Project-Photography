'use client'

import Textfield from '@/components/atoms/Textfield'
import { showToast } from '@/components/atoms/Toast'
import { ContentPage } from '@/components/molecules/ContentPage'
import Dialog from '@/components/molecules/Dialog'
import { OperationStatus } from '@/components/organisms/Extract/OperationStatus'
import { TableExtract } from '@/components/organisms/TableExtract'
import { useDebounce } from '@/hooks/useDebounce'
import { ExtractInfo, getExtractInfo } from '@/services/extract/extract'
import { useClientStore } from '@/stores/ClientStore'
import { useExtractStore } from '@/stores/Extract'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react'
import { FiHome, FiLoader, FiSearch } from 'react-icons/fi'
import PanelTemplate from '../PanelTemplate'

const DashboardFilter = dynamic(
  () => import('@/components/molecules/DashboardFilter'),
  {
    ssr: false,
  },
)

const ExtractTemplate = () => {
  const t = useTranslations()
  const {
    loadTransactions,
    setSelectedId,
    currentSorting,
    initialDate,
    rowCount,
    setInitialDate,
    finalDate,
    ExtractData,
    setFinalDate,
    searchText,
    currentPagination,
    setSearchText,
  } = useExtractStore()
  const { selectedClient } = useClientStore()
  const [openExtract, setOpenExtract] = useState(false)
  const [operationStatus, setOperarionStatus] = useState<ExtractInfo>()
  const [isLoadingOperationStatus, setIsLoadingOperarionStatus] =
    useState(false)
  const isFirstRender = useRef(true)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const handleDateChange = (startDate: string, endDate: string) => {
    setInitialDate(startDate)
    setFinalDate(endDate)
  }

  const getClientById = async (id: number) => {
    setIsLoadingOperarionStatus(true)
    try {
      const response = await getExtractInfo(id)
      setOperarionStatus(response.data)
      setIsLoadingOperarionStatus(false)
    } catch (error) {
      setIsLoadingOperarionStatus(false)
      if (error instanceof Error) {
        showToast('error', `${error.message}`, 5000, 'bottom-left')
      }
    }
  }

  const handleExtractInfo = async (id: number) => {
    setOpenExtract(true)
    getClientById(id)
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
    <PanelTemplate title={t('CENTRAL')} icon={<FiHome className="h-m w-m" />}>
      <div className="pb-xxxm">
        <ContentPage pageName={t('Extrato')}>
          <div className="flex items-end justify-between sm:flex-col sm:gap-s sm:items-start">
            <div>
              <div className="flex gap-xs mt-xm sm:flex-row">
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
            <TableExtract
              data={ExtractData}
              rowCount={rowCount}
              onPaginationChange={loadTransactions}
              reloadData={loadTransactionsWithDebounce}
              setSelectedId={setSelectedId}
              initialPagination={currentPagination}
              initialSorting={currentSorting}
              onExtractInfo={handleExtractInfo}
            />
          </div>
        </ContentPage>
      </div>
      <Dialog
        title="Status da Operação"
        open={openExtract}
        onClose={() => setOpenExtract(false)}
        position="aside"
        className="min-w-[532px] sm:min-w-full"
      >
        {isLoadingOperationStatus ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <FiLoader className="animate-spin text-H3 text-grey-500" />
          </div>
        ) : (
          <OperationStatus
            operation={operationStatus}
            onClose={() => setOpenExtract(false)}
          />
        )}
      </Dialog>
    </PanelTemplate>
  )
}

export default ExtractTemplate
