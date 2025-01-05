import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import { useTranslations } from 'next-intl'
import React from 'react'
import info from './info'
import { Account } from '@/services/account/account'
import { formatterAccountTable } from './formatter'

interface TableAccountProps extends Omit<IDataTable<Account>, 'columns'> {
  reloadData: () => void
}

export const TableAccount: React.FC<TableAccountProps> = (props) => {
  const t = useTranslations()
  const { getColumns } = info
  return (
    <Table
      {...props}
      manualSorting={true}
      data={formatterAccountTable(props.data)}
      columns={getColumns(t, props.reloadData)}
    />
  )
}
