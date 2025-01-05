/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import PanelTemplate from '../PanelTemplate'
import Button from '@/components/atoms/Button'
import { FiFileText, FiPlusCircle, FiSearch } from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import { ContentPage } from '@/components/molecules/ContentPage'
import Textfield from '@/components/atoms/Textfield'
import { TableEmployees } from '@/components/organisms/TableEmployees'
import { useDebounce } from '@/hooks/useDebounce'
import { useEmployeesStore } from '@/stores/EmployeesStore'
import { useClientStore } from '@/stores/ClientStore'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import Dialog from '@/components/molecules/Dialog'
import { FormEmployee } from '@/components/organisms/FormEmployees'
import { FormEmployeeUpdate } from '@/components/organisms/FormEmployeesUpdate'
import { getPlan } from '@/services/employees/employees'

export default function EmployeesTemplate() {
  const t = useTranslations()
  const [clubPlan, setClubPlan] = useState(0)
  const [tableKey, setTableKey] = useState(Date.now())
  const isFirstRender = useRef(true)

  const {
    openAddEmployeeDialog,
    openUpdateEmployeeDialog,
    setSelectedEmployeeId,
    search,
    rowCount,
    employeesData,
    setOpenAddEmployeeDialog,
    selectedEmployeeId,
    setOpenUpdateEmployeeDialog,
    setSearch,
    loadEmployees,
    currentSorting,
  } = useEmployeesStore()

  const { selectedClient } = useClientStore()

  const {
    setIsSaveChangesDialogOpen,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setSaveWithoutChangesFunction,
  } = useSaveChangesDialogStore()

  const debouncedLoadEmployees = useDebounce(
    () => loadEmployees({ pageIndex: 0, pageSize: 25 }, currentSorting),
    1000,
  )

  const fetchClubPlan = async () => {
    try {
      const data = await getPlan()
      if (data) {
        setClubPlan(data.plan.id)
      } else {
        console.error('Error fetching club plan')
      }
    } catch (error) {
      console.error('Error fetching club plan', error)
    }
  }

  const debouncedFetchClubPlan = useDebounce(fetchClubPlan, 1000)

  useEffect(() => {
    if (isFirstRender.current) {
      if (selectedClient !== null) {
        isFirstRender.current = false // Marca como já renderizado
      }
      return // Sai do efeito sem chamar a função
    }
    debouncedFetchClubPlan()
  }, [selectedClient])

  const refreshData = useCallback(() => {
    setTableKey(Date.now())
  }, [])

  const handleCloseEmployeeDialog = () => {
    if (hasUnsavedChanges) {
      setIsSaveChangesDialogOpen(true)
      setSaveWithoutChangesFunction(() => setOpenAddEmployeeDialog(false))
    } else {
      setOpenAddEmployeeDialog(false)
    }
    setHasUnsavedChanges(false)
  }

  const handleCloseUpdateEmployeeDialog = () => {
    if (hasUnsavedChanges) {
      setIsSaveChangesDialogOpen(true)
      setSaveWithoutChangesFunction(() => setOpenUpdateEmployeeDialog(false))
    } else {
      setOpenUpdateEmployeeDialog(false)
    }
    setHasUnsavedChanges(false)
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

    debouncedLoadEmployees()
  }, [search, selectedClient])

  return (
    <PanelTemplate
      title={t('Panel.Employees.title')}
      icon={<FiFileText className="h-m w-m" />}
    >
      <Dialog
        position="aside"
        title={t('Panel.Employees.dialogFormRegister')}
        open={openAddEmployeeDialog}
        className="w-[531px]"
        onClose={handleCloseEmployeeDialog}
      >
        <FormEmployee
          handleClose={handleCloseEmployeeDialog}
          refreshData={refreshData}
          setOpenAddPlayerDialog={setOpenAddEmployeeDialog}
          clubPlanId={clubPlan}
        />
      </Dialog>
      <Dialog
        position="aside"
        title={t('Panel.Employees.titleUpdate')}
        open={openUpdateEmployeeDialog}
        className="w-[531px]"
        onClose={handleCloseUpdateEmployeeDialog}
      >
        <FormEmployeeUpdate
          onClose={handleCloseUpdateEmployeeDialog}
          refreshData={refreshData}
          id={selectedEmployeeId}
          setOpenUpdateEmployeeDialog={setOpenUpdateEmployeeDialog}
          clubPlanId={clubPlan}
        />
      </Dialog>
      <div className="pb-xxxm">
        <ContentPage
          pageName={t('Panel.Employees.pageName')}
          pageButton={
            <Button
              variant="outline"
              addIcon={<FiPlusCircle size={18} />}
              width={170}
              onClick={() => {
                setOpenAddEmployeeDialog(true)
              }}
              showIconOnly
            >
              {t('Panel.Employees.buttonAddCollaborator')}
            </Button>
          }
        >
          <div className="flex items-center justify-end sm:flex-col sm:gap-s sm:items-start">
            <div className="text-BODY-XM font-Regular text-grey-700 w-full max-w-[312px] sm:max-w-full">
              <Textfield
                name="search-employee"
                placeholder={t('Panel.Employees.searchPlaceholder')}
                icon={<FiSearch size={24} className="text-grey-600" />}
                onChange={handleSearch}
                value={search}
              />
            </div>
          </div>
          <div className="mt-s">
            <TableEmployees
              key={tableKey}
              data={employeesData}
              rowCount={rowCount}
              setSelectedEmployeeId={setSelectedEmployeeId}
              onPaginationChange={loadEmployees}
              setOpenUpdateEmployeeDialog={() => {
                setOpenUpdateEmployeeDialog(true)
              }}
              initialPagination={{ pageIndex: 0, pageSize: 25 }}
              initialSorting={currentSorting}
            />
          </div>
        </ContentPage>
      </div>
    </PanelTemplate>
  )
}
