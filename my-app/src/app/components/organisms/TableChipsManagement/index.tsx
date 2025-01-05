import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import React from 'react'
import info from './info'
import { formatterChipsToChipsTable } from './formatter'
import { useTranslations } from 'next-intl'
import { ChipsList } from '@/services/chips/chips'

interface TableChipsManagementrops
  extends Omit<IDataTable<ChipsList>, 'columns'> {
  reloadData: () => void
}

export const TableChipsManagement: React.FC<TableChipsManagementrops> = (
  props,
) => {
  const t = useTranslations()
  const { getColumns } = info

  return (
    <Table
      {...props}
      manualSorting={true}
      data={formatterChipsToChipsTable(props.data)}
      columns={getColumns(t)}
    />
  )
}
