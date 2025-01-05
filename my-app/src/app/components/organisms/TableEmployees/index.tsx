import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import { useTranslations } from 'next-intl'
import React from 'react'
import info from './info'
import { Employee } from '@/services/employees/employees'
import { formatterEmployeesToEmployeesTable } from './formatter'
import { useMe } from '@/stores/Me'

interface TableEmployeesProps extends Omit<IDataTable<Employee>, 'columns'> {
  setOpenUpdateEmployeeDialog: (open: boolean) => void
  setSelectedEmployeeId: (id: number) => void
}

export const TableEmployees: React.FC<TableEmployeesProps> = (props) => {
  const { me } = useMe()
  const { setOpenUpdateEmployeeDialog, setSelectedEmployeeId, ...rest } = props
  const t = useTranslations()
  const { getColumns } = info

  return (
    <Table
      {...rest}
      manualSorting={true}
      data={formatterEmployeesToEmployeesTable(rest.data)}
      columns={getColumns(
        t,
        setOpenUpdateEmployeeDialog,
        setSelectedEmployeeId,
        me,
      )}
    />
  )
}
