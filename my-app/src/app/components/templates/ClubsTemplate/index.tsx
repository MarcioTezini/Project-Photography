'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FiSearch, FiSettings } from 'react-icons/fi'
import PanelTemplate from '../PanelTemplate'
import { useTranslations } from 'next-intl'
import { ContentPage } from '@/components/molecules/ContentPage'
import Textfield from '@/components/atoms/Textfield'
import { useClubStore } from '@/stores/ManagingClubsStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useClientStore } from '@/stores/ClientStore'
import { TableManagingClub } from '@/components/organisms/TableManagingClubs'
import Dialog from '@/components/molecules/Dialog'
import FormClientsUpdate from '@/components/organisms/FormClubsUpdate'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'

const ClubsTemplate = () => {
  const t = useTranslations()
  const {
    search,
    loadClubs,
    setSearch,
    currentSorting,
    rowCount,
    clubData,
    selectedClubId,
    openUpdateClubDialog,
    setOpenUpdateClubDialog,
    setSelectedClubId,
  } = useClubStore()
  const { selectedClient } = useClientStore()
  const isFirstRender = useRef(true)

  const {
    setIsSaveChangesDialogOpen,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setSaveWithoutChangesFunction,
  } = useSaveChangesDialogStore()

  const maxSizes = { width: 200, height: 200 }

  const [tableKey, setTableKey] = useState(Date.now())

  const loadClubsWithDebounce = useDebounce(
    () => loadClubs({ pageIndex: 0, pageSize: 25 }, currentSorting),
    1000,
  )

  const refreshData = useCallback(() => {
    setTableKey(Date.now())
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      if (selectedClient !== null) {
        isFirstRender.current = false // Marca como já renderizado
      }
      return // Sai do efeito sem chamar a função
    }

    loadClubsWithDebounce()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedClient])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleDialogClose = () => {
    if (hasUnsavedChanges) {
      setIsSaveChangesDialogOpen(true)
      setSaveWithoutChangesFunction(() => setOpenUpdateClubDialog(false))
    } else {
      setOpenUpdateClubDialog(false)
    }
    setHasUnsavedChanges(false)
  }

  return (
    <PanelTemplate
      title={t('Panel.ManagingClubs.titlePanel')}
      icon={<FiSettings className="h-m w-m" />}
    >
      <div className="pb-xxxm">
        <ContentPage pageName={t('Panel.ManagingClubs.titlePage')}>
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
            <TableManagingClub
              key={tableKey}
              data={clubData}
              rowCount={rowCount}
              onPaginationChange={loadClubs}
              reloadData={loadClubsWithDebounce}
              setOpenUpdateClubDialog={setOpenUpdateClubDialog}
              setSelectedClubId={setSelectedClubId}
              initialPagination={{ pageIndex: 0, pageSize: 25 }}
              initialSorting={currentSorting}
            />
          </div>
          <Dialog
            position="aside"
            title={t('Panel.ManagingClubs.FormClubs.NameForm')}
            open={openUpdateClubDialog}
            onClose={handleDialogClose}
            className="w-[531px]"
          >
            <FormClientsUpdate
              onClose={handleDialogClose}
              id={selectedClubId}
              refreshData={refreshData}
              setOpenAddAgentDialog={setOpenUpdateClubDialog}
              maxSizes={maxSizes}
            />
          </Dialog>
        </ContentPage>
      </div>
    </PanelTemplate>
  )
}

export default ClubsTemplate
