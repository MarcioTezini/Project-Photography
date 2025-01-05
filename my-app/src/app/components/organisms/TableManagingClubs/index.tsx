import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import { useTranslations } from 'next-intl'
import React from 'react'
import info from './info'
import { ManagingClubs } from '@/services/clubs/clubs'
import { formatterManigingClubsTable } from './formatter'

interface TableManagingClubProps
  extends Omit<IDataTable<ManagingClubs>, 'columns'> {
  reloadData: () => void
  setOpenUpdateClubDialog: (open: boolean) => void
  setSelectedClubId: (id: number) => void
}

export const TableManagingClub: React.FC<TableManagingClubProps> = (props) => {
  const t = useTranslations()
  const { getColumns } = info

  return (
    <Table
      {...props}
      manualSorting={true}
      data={formatterManigingClubsTable(props.data)}
      columns={getColumns(
        t,
        props.reloadData,
        props.setOpenUpdateClubDialog,
        props.setSelectedClubId,
      )}
    />
  )
}
