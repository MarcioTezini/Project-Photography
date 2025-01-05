import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import { useTranslations } from 'next-intl'
import React from 'react'
import info from './info'
import { AgentWhitelist } from '@/services/agent/agent'
import { formatterWhitelistAgentsToWhitelistTable } from './formatter'

interface TableWhitelistProps
  extends Omit<IDataTable<AgentWhitelist>, 'columns'> {
  reloadData: () => void
  setOpenRemoveAgentDialog: (open: boolean) => void
  setOpenUpdateAgentDialog: (open: boolean) => void
  setSelectedAgentId: (id: number) => void
}

export const TableWhitelist: React.FC<TableWhitelistProps> = (props) => {
  const t = useTranslations()
  const { getColumns } = info

  return (
    <Table
      {...props}
      manualSorting={true}
      data={formatterWhitelistAgentsToWhitelistTable(props.data)}
      columns={getColumns(
        t,
        props.reloadData,
        props.setOpenRemoveAgentDialog,
        props.setOpenUpdateAgentDialog,
        props.setSelectedAgentId,
      )}
    />
  )
}
