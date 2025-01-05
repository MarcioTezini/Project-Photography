import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import React from 'react'
import info from './info'
import { formatterExtractToExtractTable } from './fomatter'
import { useTranslations } from 'next-intl'
import { ExtractList } from '@/services/extract/extract'

interface TableExtractProps extends Omit<IDataTable<ExtractList>, 'columns'> {
  reloadData: () => void
  setSelectedId: (id: number) => void
  onExtractInfo: (id: number) => void
}

export const TableExtract: React.FC<TableExtractProps> = (props) => {
  const { onExtractInfo } = props
  const t = useTranslations()
  const { getColumns } = info

  return (
    <Table
      {...props}
      manualSorting={true}
      data={formatterExtractToExtractTable(props.data)}
      columns={getColumns(t, { onExtractInfo })}
    />
  )
}
