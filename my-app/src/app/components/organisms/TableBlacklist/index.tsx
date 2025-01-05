import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import { useTranslations } from 'next-intl'
import React from 'react'
import info from './info'
import { Agent } from '@/services/agent/agent'
import { formatterBlacklistAgentsToBlacklistTable } from './formatter'

interface TableBlacklistProps extends Omit<IDataTable<Agent>, 'columns'> {
  setOpenRemovePlayerDialog: (open: boolean) => void
  setSelectedPlayerId: (id: number) => void
}

export const TableBlacklist: React.FC<TableBlacklistProps> = (props) => {
  const { setOpenRemovePlayerDialog, setSelectedPlayerId, ...rest } = props
  const t = useTranslations()
  const { getColumns } = info

  return (
    <Table
      {...rest}
      manualSorting={true}
      data={formatterBlacklistAgentsToBlacklistTable(rest.data)}
      columns={getColumns(t, setOpenRemovePlayerDialog, setSelectedPlayerId)}
    />
  )
}
