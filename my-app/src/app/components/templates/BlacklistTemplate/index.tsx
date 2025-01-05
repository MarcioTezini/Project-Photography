/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import PanelTemplate from '../PanelTemplate'
import Dialog from '@/components/molecules/Dialog'
import Button from '@/components/atoms/Button'
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiFileText,
  FiPlusCircle,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi'
import { FormBlacklist } from '@/components/organisms/FormBlacklist'
import { useTranslations } from 'next-intl'
import { ContentPage } from '@/components/molecules/ContentPage'
import Textfield from '@/components/atoms/Textfield'
import { TableBlacklist } from '@/components/organisms/TableBlacklist'
import { useDebounce } from '@/hooks/useDebounce'
import { useBlacklistStore } from '@/stores/BlacklistStore'
import { deleteAgentFromBlacklist } from '@/services/agent/agent'
import { showToast } from '@/components/atoms/Toast'
import { useClientStore } from '@/stores/ClientStore'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'

export default function BlacklistTemplate() {
  const t = useTranslations()
  const {
    openAddPlayerDialog,
    openRemovePlayerDialog,
    search,
    rowCount,
    blacklistData,
    setOpenAddPlayerDialog,
    setOpenRemovePlayerDialog,
    setSearch,
    loadAgents,
    setSelectedPlayerId,
    selectedPlayerId,
    currentSorting,
  } = useBlacklistStore()
  const { selectedClient } = useClientStore()
  const isFirstRender = useRef(true)

  const {
    setIsSaveChangesDialogOpen,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setSaveWithoutChangesFunction,
  } = useSaveChangesDialogStore()

  const [tableKey, setTableKey] = useState(Date.now())

  const debouncedLoadAgents = useDebounce(
    () => loadAgents({ pageIndex: 0, pageSize: 25 }, currentSorting),
    1000,
  )

  const refreshData = useCallback(() => {
    setTableKey(Date.now())
  }, [])

  const handleClosePlayerDialog = () => {
    if (hasUnsavedChanges) {
      setIsSaveChangesDialogOpen(true)
      setSaveWithoutChangesFunction(() => setOpenAddPlayerDialog(false))
    } else {
      setOpenAddPlayerDialog(false)
    }
    setHasUnsavedChanges(false)
  }

  const handleRemovePlayerDialog = () => {
    setOpenRemovePlayerDialog(false)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    if (isFirstRender.current) {
      if (selectedClient !== null) {
        isFirstRender.current = false // Marca como já renderizado
      }
      return // Sai do efeito sem chamar a função
    }

    debouncedLoadAgents()
  }, [search, selectedClient])

  const handleRemovePlayer = async (id: number) => {
    try {
      const response = await deleteAgentFromBlacklist(id)
      if (response.success) {
        showToast(
          'success',
          t('Panel.Blacklist.removePlayerSuccess'),
          5000,
          'bottom-left',
        )

        refreshData()
      }
    } catch (error) {
      showToast(
        'error',
        t('Panel.Blacklist.removePlayerFailed'),
        5000,
        'bottom-left',
      )
    }
    setOpenRemovePlayerDialog(false)
  }

  return (
    <PanelTemplate
      title={t('Panel.Blacklist.title')}
      icon={<FiFileText className="h-m w-m" />}
    >
      <Dialog
        position="aside"
        title={t('Panel.Blacklist.FormBlacklist.titleFormBlacklist')}
        open={openAddPlayerDialog}
        className="w-[531px]"
        onClose={handleClosePlayerDialog}
      >
        <FormBlacklist
          handleClose={handleClosePlayerDialog}
          refreshData={refreshData}
          setOpenAddPlayerDialog={setOpenAddPlayerDialog}
        />
      </Dialog>
      <Dialog
        title={t('Panel.Blacklist.deletePlayerDialogTitle')}
        open={openRemovePlayerDialog}
        onClose={handleRemovePlayerDialog}
        className="sm:max-w-[328px] max-w-[400px]"
        removeHeaderPaddingX
      >
        <div className="flex flex-col items-center justify-center gap-s my-xm">
          <FiAlertTriangle className="w-[64px] h-[64px] text-notify-alert-normal" />
          <p className="text-BODY-XM font-Regular text-grey-900 text-center px-s w-10/12">
            {t('Panel.Blacklist.deletePlayerDialogMessage')}
          </p>
          <div className="flex justify-center items-center gap-s self-stretch mt-m">
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
                if (selectedPlayerId !== null) {
                  handleRemovePlayer(selectedPlayerId)
                }
              }}
              addIcon={<FiTrash2 size={16} className="text-grey-300" />}
            >
              <label className="text-grey-300">
                {t('Panel.Blacklist.deleteButtonText')}
              </label>
            </Button>
          </div>
        </div>
      </Dialog>
      <div className="pb-xxxm">
        <ContentPage
          pageName="Blacklist"
          pageButton={
            <Button
              variant="outline"
              preIcon={<FiPlusCircle width={18} height={18} />}
              width={170}
              onClick={() => {
                setOpenAddPlayerDialog(true)
              }}
              showIconOnly
            >
              {t('Panel.Blacklist.buttonAddPlayer')}
            </Button>
          }
        >
          <div className="flex items-center justify-end sm:flex-col sm:gap-s sm:items-start">
            <div className="text-BODY-XM font-Regular text-grey-700 w-full max-w-[312px] sm:max-w-full">
              <Textfield
                name="search-blacklist"
                placeholder={t('Panel.Blacklist.searchPlaceholder')}
                icon={<FiSearch size={24} className="text-grey-600" />}
                onChange={handleSearch}
                value={search}
              />
            </div>
          </div>
          <div className="mt-s">
            <TableBlacklist
              key={tableKey}
              data={blacklistData}
              rowCount={rowCount}
              onPaginationChange={loadAgents}
              setOpenRemovePlayerDialog={setOpenRemovePlayerDialog}
              setSelectedPlayerId={setSelectedPlayerId}
              initialPagination={{ pageIndex: 0, pageSize: 25 }}
              initialSorting={currentSorting}
            />
          </div>
        </ContentPage>
      </div>
    </PanelTemplate>
  )
}
