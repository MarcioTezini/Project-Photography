'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { FiSearch, FiHome, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi'
import PanelTemplate from '../PanelTemplate'
import { useTranslations } from 'next-intl'
import { ContentPage } from '@/components/molecules/ContentPage'
import Textfield from '@/components/atoms/Textfield'
import { useApproveWithdrawalStore } from '@/stores/ApproveWithdrawal'
import { useDebounce } from '@/hooks/useDebounce'
import { useClientStore } from '@/stores/ClientStore'
import { TableApproveWithdrawal } from '@/components/organisms/TableApproveWithdrawal'
import {
  reproveApproveWithdrawal,
  successApproveWithdrawal,
} from '@/services/withdrawal/withdrawal'
import { showToast } from '@/components/atoms/Toast'
import Dialog from '@/components/molecules/Dialog'
import Button from '@/components/atoms/Button'

const ApproveWithdrawalTemplate = () => {
  const t = useTranslations()
  const {
    search,
    loadWithdrawals,
    setSearch,
    setOpenApprovePlayerDialog,
    currentSorting,
    withdrawalData,
    rowCount,
    openRemovePlayerDialog,
    setOpenRemovePlayerDialog,
    openApprovePlayerDialog,
    setSelectedId,
    selectedId,
    playerNickDialog,
    setPlayerNickDialog,
  } = useApproveWithdrawalStore()
  const { selectedClient } = useClientStore()
  const [tableKey, setTableKey] = useState(Date.now())
  const [isSubmittingAprove, setIsSubmittingApprove] = useState(false)
  const [isSubmittingRecuse, setIsSubmittingRecuse] = useState(false)

  const loadWithdrawalsDebounce = useDebounce(
    () => loadWithdrawals({ pageIndex: 0, pageSize: 25 }, currentSorting),
    1000,
  )

  const refreshData = useCallback(() => {
    setTableKey(Date.now())
  }, [])

  const handleRemovePlayerDialog = () => {
    setOpenRemovePlayerDialog(false)
  }

  const handleApprovePlayerDialog = () => {
    setOpenApprovePlayerDialog(false)
  }

  useEffect(() => {
    loadWithdrawalsDebounce()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedClient])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleApproveWithdrawal = async (id: number) => {
    setIsSubmittingApprove(true)
    try {
      const response = await successApproveWithdrawal(id)
      if (response.success) {
        showToast(
          'success',
          t('Panel.ApproveWithdrawal.Saqueaprovadocomsucesso'),
          5000,
          'bottom-left',
        )
        setOpenApprovePlayerDialog(false)
        refreshData()
        setIsSubmittingApprove(false)
      }
    } catch (error) {
      setIsSubmittingApprove(false)
      showToast('error', 'Error', 5000, 'bottom-left')
      setOpenApprovePlayerDialog(false)
      refreshData()
    }
  }

  const handleRecuseWithdrawal = async (id: number) => {
    setIsSubmittingRecuse(true)
    try {
      const response = await reproveApproveWithdrawal(id)
      if (response.success) {
        showToast(
          'success',
          t('Panel.ApproveWithdrawal.Saquerecusadocomsucesso'),
          5000,
          'bottom-left',
        )
        setIsSubmittingRecuse(false)
        refreshData()
        setOpenRemovePlayerDialog(false)
      }
    } catch (error) {
      setIsSubmittingRecuse(false)
      if (error instanceof Error) {
        showToast(
          'error',
          `${t(`Errors.${error.message}`)}`,
          5000,
          'bottom-left',
        )
        setOpenRemovePlayerDialog(false)
        refreshData()
      }
    }
  }

  return (
    <PanelTemplate
      title={t('Panel.ApproveWithdrawal.titlePanel')}
      icon={<FiHome className="h-m w-m" />}
    >
      <Dialog
        title={t('Panel.ApproveWithdrawal.recuseTitle')}
        open={openRemovePlayerDialog}
        onClose={handleRemovePlayerDialog}
        className="max-w-[328px]"
      >
        <div className="flex flex-col items-center justify-center gap-s mb-s mt-s">
          <FiAlertTriangle className="w-[64px] h-[64px] text-notify-alert-normal" />
          <div>
            <p className="text-BODY-XM font-Regular text-grey-900 text-center">
              {t('Panel.ApproveWithdrawal.recuseWithdrawal')}
            </p>
            <p className="text-center">{`${playerNickDialog}?`}</p>
          </div>
          <div className="flex justify-center items-center gap-s self-stretch mt-xs">
            <Button
              preIcon={<FiArrowLeft className="w-[16px] h-[16px]" />}
              variant="text"
              onClick={handleRemovePlayerDialog}
            >
              {t('Panel.Blacklist.backButtonText')}
            </Button>
            <Button
              variant="warning"
              onClick={() => {
                if (selectedId !== null) {
                  handleRecuseWithdrawal(selectedId)
                }
              }}
              disabled={isSubmittingRecuse}
            >
              <label className="text-grey-300">
                {t('Panel.ApproveWithdrawal.recuse')}
              </label>
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        title={t('Panel.ApproveWithdrawal.approveTitle')}
        open={openApprovePlayerDialog}
        onClose={handleApprovePlayerDialog}
        className="max-w-[328px]"
      >
        <div className="flex flex-col items-center justify-center gap-s mb-s mt-s">
          <FiAlertTriangle className="w-[64px] h-[64px] text-notify-alert-normal" />
          <div>
            <p className="text-BODY-XM font-Regular text-grey-900 text-center">
              {t('Panel.ApproveWithdrawal.approveWithdrawal')}
            </p>
            <p className="text-center">{`${playerNickDialog}?`}</p>
          </div>
          <div className="flex justify-center items-center gap-s self-stretch mt-xs">
            <Button
              preIcon={<FiArrowLeft className="w-[16px] h-[16px]" />}
              variant="text"
              onClick={handleApprovePlayerDialog}
            >
              {t('Panel.Blacklist.backButtonText')}
            </Button>
            <Button
              variant="success"
              onClick={() => {
                if (selectedId !== null) {
                  handleApproveWithdrawal(selectedId)
                }
              }}
              disabled={isSubmittingAprove}
            >
              <label className="text-grey-300">
                {t('Panel.ApproveWithdrawal.approve')}
              </label>
            </Button>
          </div>
        </div>
      </Dialog>

      <div className="pb-xxxm">
        <ContentPage pageName={t('Panel.ApproveWithdrawal.titlePage')}>
          <div className="flex items-center justify-end sm:flex-col sm:gap-s sm:items-start">
            <div className="text-BODY-XM font-Regular text-grey-700 w-full max-w-[312px] sm:max-w-full">
              <Textfield
                name="search-clients"
                placeholder={t('Panel.ApproveWithdrawal.searchPlaceholder')}
                icon={<FiSearch size={24} className="text-grey-600" />}
                onChange={handleSearch}
                value={search}
              />
            </div>
          </div>
          <div className="mt-s">
            <TableApproveWithdrawal
              key={tableKey}
              data={withdrawalData}
              setPlayerNickDialog={setPlayerNickDialog}
              rowCount={rowCount}
              setSelectedId={setSelectedId}
              setOpenApprovePlayerDialog={setOpenApprovePlayerDialog}
              setOpenRemovePlayerDialog={setOpenRemovePlayerDialog}
              onPaginationChange={loadWithdrawals}
              reloadData={loadWithdrawalsDebounce}
              initialPagination={{ pageIndex: 0, pageSize: 25 }}
              initialSorting={currentSorting}
            />
          </div>
        </ContentPage>
      </div>
    </PanelTemplate>
  )
}

export default ApproveWithdrawalTemplate
