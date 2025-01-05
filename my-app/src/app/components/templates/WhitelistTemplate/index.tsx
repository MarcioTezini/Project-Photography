'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  FiFileText,
  FiPlusCircle,
  FiSearch,
  FiAlertTriangle,
  FiArrowLeft,
  FiTrash2,
} from 'react-icons/fi'
import PanelTemplate from '../PanelTemplate'
import Dialog from '@/components/molecules/Dialog'
import FormWhitelist from '@/components/organisms/FormWhitelist'
import { useTranslations } from 'next-intl'
import { ContentPage } from '@/components/molecules/ContentPage'
import Textfield from '@/components/atoms/Textfield'
import Button from '@/components/atoms/Button'
import { useWhitelistStore } from '@/stores/WhitelistStore'
import { useDebounce } from '@/hooks/useDebounce'
import { TableWhitelist } from '@/components/organisms/TableWitelist'
import { showToast } from '@/components/atoms/Toast'
import { deleteAgentFromWhitelist } from '@/services/agent/agent'
import FormWhitelistUpdate from '@/components/organisms/FormWhitelistUpdate'
import { useClientStore } from '@/stores/ClientStore'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'

const WhitelistTemplate = () => {
  const t = useTranslations()
  const {
    openAddAgentDialog,
    openRemoveAgentDialog,
    openUpdateAgentDialog,
    setOpenAddAgentDialog,
    setOpenRemoveAgentDialog,
    setOpenUpdateAgentDialog,
    selectedAgentId,
    setSelectedAgentId,
    search,
    rowCount,
    whitelistData,
    loadAgents,
    setSearch,
    currentSorting,
  } = useWhitelistStore()
  const { selectedClient } = useClientStore()
  const isFirstRender = useRef(true)
  const [tableKey, setTableKey] = useState(Date.now())

  const refreshData = useCallback(() => {
    setTableKey(Date.now())
  }, [])

  const loadAgentsWithDebounce = useDebounce(
    () => loadAgents({ pageIndex: 0, pageSize: 25 }, currentSorting),
    1000,
  )

  useEffect(() => {
    if (isFirstRender.current) {
      if (selectedClient !== null) {
        isFirstRender.current = false // Marca como já renderizado
      }
      return // Sai do efeito sem chamar a função
    }

    loadAgentsWithDebounce()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedClient])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const {
    setIsSaveChangesDialogOpen,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setSaveWithoutChangesFunction,
  } = useSaveChangesDialogStore()

  const handleCloseRemoveAgentDialog = () => setOpenRemoveAgentDialog(false)
  const handleRemoveAgentDialog = () => setOpenRemoveAgentDialog(false)

  const handleRemoveAgent = async (id: number) => {
    try {
      const response = await deleteAgentFromWhitelist(id)
      if (response.success) {
        showToast(
          'success',
          t('Panel.Whitelist.removeAgentSuccess'),
          5000,
          'bottom-left',
        )

        refreshData()
      }
    } catch (error) {
      showToast(
        'error',
        t('Panel.Whitelist.removeAgentFailed'),
        5000,
        'bottom-left',
      )
    }
    setOpenRemoveAgentDialog(false)
  }

  const handleDialogClose = () => {
    if (hasUnsavedChanges) {
      setIsSaveChangesDialogOpen(true)
      setSaveWithoutChangesFunction(() => setOpenUpdateAgentDialog(false))
    } else {
      setOpenUpdateAgentDialog(false)
    }
    setHasUnsavedChanges(false)
  }

  const handleCloseAddAgentDialog = () => {
    if (hasUnsavedChanges) {
      setIsSaveChangesDialogOpen(true)
      setSaveWithoutChangesFunction(() => setOpenAddAgentDialog(false))
    } else {
      setOpenAddAgentDialog(false)
    }
    setHasUnsavedChanges(false)
  }

  return (
    <PanelTemplate
      title={t('Panel.Whitelist.Registration')}
      icon={<FiFileText className="h-m w-m" />}
    >
      <div className="pb-xxxm">
        <ContentPage
          pageName={t('Panel.Whitelist.Whitelist')}
          pageButton={
            <Button
              variant="outline"
              preIcon={<FiPlusCircle width={18} height={18} />}
              width={170}
              onClick={() => setOpenAddAgentDialog(true)}
              showIconOnly
            >
              {t('Panel.Whitelist.buttonAddAgent')}
            </Button>
          }
        >
          <div className="flex items-center justify-end sm:flex-col sm:gap-s sm:items-start">
            <div className="text-BODY-XM font-Regular text-grey-700 w-full max-w-[312px] sm:max-w-full">
              <Textfield
                name="search-clients"
                placeholder={t('Panel.MyClients.searchPlaceholder')}
                icon={<FiSearch size={24} className="text-grey-600" />}
                onChange={handleSearch}
                value={search}
              />
            </div>
          </div>
          <div className="mt-s">
            <TableWhitelist
              key={tableKey}
              data={whitelistData}
              rowCount={rowCount}
              onPaginationChange={loadAgents}
              reloadData={loadAgentsWithDebounce}
              setOpenRemoveAgentDialog={setOpenRemoveAgentDialog}
              setOpenUpdateAgentDialog={setOpenUpdateAgentDialog}
              setSelectedAgentId={setSelectedAgentId}
              initialPagination={{ pageIndex: 0, pageSize: 25 }}
              initialSorting={currentSorting}
            />
          </div>
        </ContentPage>
      </div>
      <Dialog
        position="aside"
        title={t('Panel.Whitelist.FormWhitelist.titleFormWhitelist')}
        open={openAddAgentDialog}
        onClose={handleCloseAddAgentDialog}
        className="w-[531px]"
      >
        <FormWhitelist
          onClose={handleCloseAddAgentDialog}
          refreshData={refreshData}
          setOpenAddAgentDialog={setOpenAddAgentDialog}
        />
      </Dialog>
      <Dialog
        position="aside"
        title={t('Panel.Whitelist.FormWhitelist.titleFormWhitelistEdit')}
        open={openUpdateAgentDialog}
        onClose={handleDialogClose}
        className="w-[531px]"
      >
        <FormWhitelistUpdate
          onClose={handleDialogClose}
          id={selectedAgentId}
          refreshData={refreshData}
          setOpenAddAgentDialog={setOpenUpdateAgentDialog}
        />
      </Dialog>
      <Dialog
        title={t('Panel.Whitelist.deleteAgentDialogTitle')}
        open={openRemoveAgentDialog}
        onClose={handleRemoveAgentDialog}
        className="sm:max-w-[328px] max-w-[400px]"
        removeHeaderPaddingX
      >
        <div className="flex flex-col items-center justify-center gap-s my-xm">
          <FiAlertTriangle size={64} className="text-notify-alert-normal" />
          <p className="text-BODY-XM font-Regular text-grey-900 text-center px-s w-10/12">
            {t('Panel.Whitelist.deleteAgentDialogMessage')}
          </p>
          <div className="flex justify-center items-center gap-s self-stretch mt-m">
            <Button
              preIcon={<FiArrowLeft className="w-[16px] h-[16px]" />}
              variant="text"
              onClick={handleCloseRemoveAgentDialog}
            >
              {t('Panel.Whitelist.FormWhitelist.buttonBack')}
            </Button>
            <Button
              variant="warning"
              onClick={() => {
                if (selectedAgentId !== null) {
                  handleRemoveAgent(selectedAgentId)
                }
              }}
              addIcon={<FiTrash2 size={16} className="text-grey-300" />}
            >
              <label className="text-grey-300">
                {t('Panel.Whitelist.warningButton')}
              </label>
            </Button>
          </div>
        </div>
      </Dialog>
    </PanelTemplate>
  )
}

export default WhitelistTemplate
