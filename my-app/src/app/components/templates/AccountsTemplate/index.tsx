'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FiPlusCircle, FiSearch, FiSettings } from 'react-icons/fi'
import PanelTemplate from '../PanelTemplate'
import Dialog from '@/components/molecules/Dialog'
import { useTranslations } from 'next-intl'
import { ContentPage } from '@/components/molecules/ContentPage'
import Textfield from '@/components/atoms/Textfield'
import Button from '@/components/atoms/Button'
import { useAccountStore } from '@/stores/AccountStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useClientStore } from '@/stores/ClientStore'
import FormAccounts from '@/components/organisms/FormAccount'
import { TableAccount } from '@/components/organisms/TableAccount'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { useSwitchStore } from '@/stores/SwitchStore'

const AccountsTemplate = () => {
  const t = useTranslations()
  const {
    openAddAccountDialog,
    setOpenAddAccountDialog,
    search,
    loadAccounts,
    setSearch,
    currentSorting,
    accountData,
    rowCount,
  } = useAccountStore()
  const { selectedClient } = useClientStore()

  const {
    setIsSaveChangesDialogOpen,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setSaveWithoutChangesFunction,
  } = useSaveChangesDialogStore()
  const { switchStates } = useSwitchStore()
  const isFirstRender = useRef(true)

  const [tableKey, setTableKey] = useState(Date.now())

  const refreshData = useCallback(() => {
    setTableKey(Date.now())
  }, [])

  const loadAgentsWithDebounce = useDebounce(() => {
    const { currentPagination, currentSorting } = useAccountStore.getState()
    if (switchStates) {
      loadAccounts(currentPagination, currentSorting)
    } else {
      loadAccounts({ pageIndex: 0, pageSize: 25 }, currentSorting)
    }
  }, 1000)

  useEffect(() => {
    if (isFirstRender.current) {
      if (selectedClient !== null) {
        isFirstRender.current = false // Marca como já renderizado
      }
      return // Sai do efeito sem chamar a função
    }

    loadAgentsWithDebounce()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedClient, switchStates])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleCloseAddAccountDialog = () => {
    if (hasUnsavedChanges) {
      setIsSaveChangesDialogOpen(true)
      setSaveWithoutChangesFunction(() => setOpenAddAccountDialog(false))
    } else {
      setOpenAddAccountDialog(false)
    }
    setHasUnsavedChanges(false)
  }

  return (
    <PanelTemplate
      title={t('Panel.Account.titlePanel')}
      icon={<FiSettings className="h-m w-m" />}
    >
      <div className="pb-xxxm">
        <ContentPage
          pageName={t('Panel.Account.titlePage')}
          pageButton={
            <Button
              variant="outline"
              width={170}
              onClick={() => setOpenAddAccountDialog(true)}
              showIconOnly
              addIcon={<FiPlusCircle width={18} height={18} />}
            >
              {t('Panel.Account.buttonRegister')}
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
            <TableAccount
              key={tableKey}
              data={accountData}
              rowCount={rowCount}
              onPaginationChange={loadAccounts}
              reloadData={loadAgentsWithDebounce}
              initialPagination={{ pageIndex: 0, pageSize: 25 }}
              initialSorting={currentSorting}
            />
          </div>
        </ContentPage>
      </div>
      <Dialog
        position="aside"
        title={t('Panel.Account.dialogTitle')}
        open={openAddAccountDialog}
        onClose={handleCloseAddAccountDialog}
        className="w-[531px] sm:!h-[492px]"
      >
        <FormAccounts
          onClose={handleCloseAddAccountDialog}
          setOpenAddAccountDialog={setOpenAddAccountDialog}
          refreshData={refreshData}
        />
      </Dialog>
    </PanelTemplate>
  )
}

export default AccountsTemplate
