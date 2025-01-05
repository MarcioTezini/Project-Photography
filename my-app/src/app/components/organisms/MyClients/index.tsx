/* eslint-disable react-hooks/exhaustive-deps */
import { ContentPage } from '@/components/molecules/ContentPage'
import {
  IDataTablePagination,
  IDataTableSorting,
} from '@/components/molecules/DataTable/types'
import Dialog from '@/components/molecules/Dialog'
import { MyClient } from '@/entities/my-clients'
import { useDebounce } from '@/hooks/useDebounce'
import { clientService } from '@/services/clients/clients'
import { useClientStore } from '@/stores/ClientStore'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useState } from 'react'
import { FiFilter } from 'react-icons/fi'
import { EditClient } from '../EditClient'
import { TableClients } from '../TableMyClients'
import { useMyClientStore } from '@/stores/MyClientStore'
import Button from '@/components/atoms/Button'
import { FormFilterMyData } from '../FormFilterMyData'
import { useFormFilterStore } from '@/stores/FormFilterPropsStore'
import { FaArrowsRotate } from 'react-icons/fa6'
import { showToast } from '@/components/atoms/Toast'

const Clients = () => {
  const t = useTranslations()
  const { selectedClient } = useClientStore()

  const [myClients, setMyClients] = React.useState<MyClient[]>([])
  const [rowCount, setRowCount] = React.useState(0)
  const [currentSorting, setCurrentSorting] = React.useState<IDataTableSorting>(
    [{ id: '2', desc: false }],
  )
  const [currentPagination, setCurrentPagination] =
    React.useState<IDataTablePagination>({ pageIndex: 0, pageSize: 25 })
  const [selectedClientData, setSelectedClientData] = React.useState<MyClient>()
  const [isEditing, setIsEditing] = useState(false)
  const [openFilter, setOpenFilter] = useState(false)
  const { hasUnsavedChanges, setIsSaveChangesDialogOpen } =
    useSaveChangesDialogStore()
  const { setEditClientFormData } = useMyClientStore()
  const { formData, formDataCount, resetFormData } = useFormFilterStore()
  const isFormDataEmpty = Object.values(formData).every((value) => !value)

  // Estado para armazenar os filtros aplicados
  const [filters, setFilters] = React.useState({
    document: '',
    name: '',
    initialDate: '',
    finalDate: '',
  })

  const [tableKey, setTableKey] = useState(Date.now())

  const refreshData = useCallback(() => {
    setTableKey(Date.now())
  }, [])

  const getInitialMyClientsData = async () => {
    loadClients({ pageIndex: 0, pageSize: 25 }, currentSorting)
  }

  const loadClientsWithDebounce = useDebounce(
    () => getInitialMyClientsData(),
    1000,
  )

  useEffect(() => {
    loadClientsWithDebounce()
  }, [selectedClient])

  const handleOpenEdit = () => {
    setIsEditing(true)
  }

  const handleOpenFilter = async () => {
    if (hasUnsavedChanges) {
      return setIsSaveChangesDialogOpen(true)
    }

    if (isFormDataEmpty) {
      try {
        await getInitialMyClientsData()
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      }
    }
    setOpenFilter(false)
  }

  const handleClearFilters = async () => {
    resetFormData()
    try {
      await getInitialMyClientsData()
      showToast(
        'success',
        t('Panel.MyClients.FiltersCleared'),
        5000,
        'bottom-left',
      )
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  const handleCloseEdit = () => {
    if (hasUnsavedChanges) {
      setIsSaveChangesDialogOpen(true)
    } else {
      setIsEditing(false)
      setEditClientFormData({})
    }
  }
  const handleCloseFilter = () => {
    // Fecha o modal
    setOpenFilter(false)
  }

  const handleClose = () => {
    setIsEditing(false)
    setEditClientFormData({})
  }

  const getClientById = async (id: number) => {
    try {
      const client = await clientService.getById({ id })
      setSelectedClientData(client)
    } catch (error) {
      console.error('Request error getClientById', error)
    }
  }

  const handleEditClient = async (id: number) => {
    handleOpenEdit()
    getClientById(id)
  }

  const handleDashboardFilter = (filterData: {
    pagination: IDataTablePagination
    sorting: IDataTableSorting
    document: string
    name: string
    initialDate: string
    finalDate: string
  }) => {
    // Atualiza o estado com os filtros aplicados
    setFilters(filterData)
    setCurrentPagination(filterData.pagination)
    setCurrentSorting(filterData.sorting)

    refreshData()
  }

  const loadClients = async (
    pagination: IDataTablePagination,
    sorting: IDataTableSorting,
    document?: string,
    name?: string,
    dateStart?: string,
    dateEnd?: string,
  ) => {
    setCurrentSorting(sorting)
    setCurrentPagination(pagination)

    const myClientsResponse = await clientService.getMyClients({
      document: document ?? '',
      name: name ?? '',
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      columnOrder: sorting[0]?.id,
      order: sorting[0]?.desc ? '0' : '1',
      dateStart,
      dateEnd,
    })

    setMyClients(myClientsResponse?.data)
    setRowCount(myClientsResponse?.total)
    return myClientsResponse?.data
  }
  return (
    <>
      <div className="pb-xxxm">
        <ContentPage pageName={t('Panel.MyClients.title')}>
          <div className="flex flex-row-reverse items-center justify-between sm:gap-s sm:items-start">
            {/* <DropdownButton buttons={buttons} /> */}
            <div className="flex flex-row-reverse gap-xxs text-BODY-XM font-Regular text-grey-700 w-full max-w-[312px] sm:max-w-full">
              <Button
                type="button"
                preIcon={<FiFilter />}
                onClick={() => setOpenFilter(true)}
                className="relative"
              >
                {t('Panel.MyClients.titleModal')}
                {formDataCount > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-300 text-grey-300 text-LABEL-Ms font-bold rounded-xxl h-m w-m flex items-center justify-center">
                    {formDataCount}
                  </span>
                )}
              </Button>
              <Button
                type="button"
                addIcon={<FaArrowsRotate width={30} height={30} />}
                onClick={handleClearFilters}
                variant="text"
                disabled={isFormDataEmpty}
              >
                {t('Panel.MyClients.clearFilter')}
              </Button>
            </div>
          </div>
          <div className="mt-s">
            <TableClients
              key={tableKey}
              data={myClients}
              rowCount={rowCount}
              onPaginationChange={(pagination, sorting) =>
                loadClients(
                  pagination,
                  sorting,
                  filters.document,
                  filters.name,
                  filters.initialDate,
                  filters.finalDate,
                )
              }
              onEditClient={handleEditClient}
              initialPagination={currentPagination}
              initialSorting={currentSorting}
            />
          </div>
        </ContentPage>
      </div>
      <Dialog
        title={t('Panel.MyClients.titleDialog')}
        open={isEditing}
        onClose={handleCloseEdit}
        position="aside"
        className="min-w-[532px] sm:min-w-full"
      >
        <EditClient
          clientData={selectedClientData}
          closeEditing={handleClose}
          onLoadClients={() => {
            selectedClientData?.id && getClientById(selectedClientData?.id)
            getInitialMyClientsData()
          }}
        />
      </Dialog>
      <Dialog
        className="min-w-[532px] sm:min-w-full"
        open={openFilter}
        onClose={handleOpenFilter}
        position="aside"
        title={t('Panel.MyClients.titleModal')}
      >
        <FormFilterMyData
          onClose={handleCloseFilter}
          loadClients={handleDashboardFilter}
          buttonText={''}
        />
      </Dialog>
    </>
  )
}

export default Clients
