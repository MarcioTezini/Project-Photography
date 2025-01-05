import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import { useTranslations } from 'next-intl'
import React from 'react'
import info from './info'
import { formatterDashboardTable } from './formatter'
import { Transaction } from '@/services/transactions/transactions'

interface TableDashboardProps
  extends Omit<IDataTable<Transaction>, 'columns'> {}

export const TableDashboard: React.FC<TableDashboardProps> = (props) => {
  const t = useTranslations('Panel.Dashboard')
  const { getColumns } = info

  return (
    <Table
      {...props}
      data={formatterDashboardTable(props.data)}
      columns={getColumns(t)}
      enablePagination={false}
      initialSorting={[{ id: '2', desc: true }]}
    />
  )
}
