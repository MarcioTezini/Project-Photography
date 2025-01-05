import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import React from 'react'
import info from './info'
import { formatterMyWalletToMyWalletTable } from './formatter'
import { MyWalletlist } from '@/services/wallet/wallet'
import { useTranslations } from 'next-intl'

interface TableMyWalletProps extends Omit<IDataTable<MyWalletlist>, 'columns'> {
  reloadData: () => void
  setSelectedId: (id: number) => void
}

export const TableMyWallet: React.FC<TableMyWalletProps> = (props) => {
  const t = useTranslations()
  const { getColumns } = info

  return (
    <Table
      {...props}
      manualSorting={true}
      data={formatterMyWalletToMyWalletTable(props.data)}
      columns={getColumns(t)}
    />
  )
}
