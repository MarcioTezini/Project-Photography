import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import { MyClient } from '@/entities/my-clients'
import { useTranslations } from 'next-intl'
import React from 'react'
import { formatterMyClientsToMyClientsTable } from './formatter'
import info from './info'

interface TableClientsProps extends Omit<IDataTable<MyClient>, 'columns'> {
  onEditClient: (id: number) => void
}

export const TableClients: React.FC<TableClientsProps> = (props) => {
  const { onEditClient } = props
  const t = useTranslations()
  const { getColumns } = info

  return (
    <Table
      {...props}
      manualSorting={true}
      data={formatterMyClientsToMyClientsTable(props.data)}
      columns={getColumns(t, { onEditClient })}
    />
  )
}
