import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import React from 'react'
import info from './info'
import { formatterApproveWithdrawalTable } from './formatter'
import { useTranslations } from 'next-intl'
import { ApproveWithdrawal } from '@/services/withdrawal/withdrawal'

interface TableApproveWithdrawalProps
  extends Omit<IDataTable<ApproveWithdrawal>, 'columns'> {
  reloadData: () => void
  setSelectedId: (id: number) => void
  setPlayerNickDialog: (playerNickDialog: string) => void
  setOpenRemovePlayerDialog: (open: boolean) => void
  setOpenApprovePlayerDialog: (open: boolean) => void
}

export const TableApproveWithdrawal: React.FC<TableApproveWithdrawalProps> = (
  props,
) => {
  const {
    setOpenRemovePlayerDialog,
    setSelectedId,
    setPlayerNickDialog,
    setOpenApprovePlayerDialog,
    ...rest
  } = props
  const t = useTranslations()
  const { getColumns } = info

  return (
    <Table
      {...rest}
      manualSorting={true}
      data={formatterApproveWithdrawalTable(props.data)}
      columns={getColumns(
        t,
        setSelectedId,
        setPlayerNickDialog,
        setOpenRemovePlayerDialog,
        setOpenApprovePlayerDialog,
      )}
    />
  )
}
