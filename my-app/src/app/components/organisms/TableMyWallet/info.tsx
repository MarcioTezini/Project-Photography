import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import Tag from '@/components/atoms/Tag'
import {
  Client,
  DateWallet,
  MyWalletTable,
  TypesWallet,
  ValueWallet,
} from './type'
import { ClientCell } from './Cells/CustomerCell/ClientCell'
import { DateWalletCell } from './Cells/CustomerCell/DateCell'
import { ValueWalletCell } from './Cells/CustomerCell/ValueCell'
import { OperationCell } from './Cells/CustomerCell/OperationCell'

type UseTranslationsReturn = (
  key: string,
  values?: Record<string, string>,
) => string
type TagVariant =
  | 'warning'
  | 'info'
  | 'success'
  | 'alert'
  | 'poker'
  | 'cacheta'
  | 'default'
  | undefined

const renderLabel = (value: string | null | undefined) => (
  <label className="text-LABEL-L font-Medium text-grey-800">
    {value ? value.toString() : ''}
  </label>
)

const statusMapString: Record<string, string> = {
  deposit: 'Depósito',
  withdraw: 'Saque',
  tax: 'Taxa',
}

const statusMap: Record<number, string> = {
  0: 'Em Andamento',
  1: 'Erro (Aguarde)',
  2: 'Concluído',
  9: 'Cancelado',
  6: 'Cancelado',
  8: 'Estornado',
  7: 'Cancelado',
  3: 'Expirado',
}

const renderTag = (value: string | number | null | undefined) => {
  const label =
    typeof value === 'number'
      ? statusMap[value]
      : typeof value === 'string'
        ? statusMapString[value]
        : value

  const variants: Record<string, TagVariant> = {
    Depósito: 'success',
    Saque: 'warning',
    Taxa: 'alert',
    Concluído: 'success',
    Cancelado: 'warning',
    'Em Andamento': 'alert',
    'Erro (Aguarde)': 'warning',
    Estornado: 'default',
    Expirado: 'default',
  }

  const variant = label ? variants[label] : undefined
  return variant ? <Tag variant={variant}>{label}</Tag> : null
}

export const getColumns = (
  t: UseTranslationsReturn,
): DataTableColumnDef<MyWalletTable>[] => {
  return [
    {
      id: '1',
      accessorKey: 'id',
      sortDescFirst: false,
      header: 'ID',
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '4',
      accessorKey: 'date',
      sortDescFirst: false,
      header: t('Panel.MyWallet.tableColumns.0'),
      cell: (info) => <DateWalletCell {...(info.getValue() as DateWallet)} />,
    },
    {
      id: '7',
      accessorKey: 'client',
      sortDescFirst: false,
      header: t('Panel.MyWallet.tableColumns.1'),
      cell: (info) => <ClientCell {...(info.getValue() as Client)} />,
    },
    {
      id: '9',
      accessorKey: 'types',
      sortDescFirst: false,
      header: t('Panel.MyWallet.tableColumns.2'),
      cell: (info) => <OperationCell {...(info.getValue() as TypesWallet)} />,
    },
    {
      id: '6',
      accessorKey: 'wallet',
      sortDescFirst: false,
      header: t('Panel.MyWallet.tableColumns.3'),
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '2',
      accessorKey: 'values',
      sortDescFirst: false,
      header: t('Panel.MyWallet.tableColumns.4'),
      cell: (info) => <ValueWalletCell {...(info.getValue() as ValueWallet)} />,
    },
    {
      id: '3',
      accessorKey: 'status',
      sortDescFirst: false,
      header: t('Panel.MyWallet.tableColumns.5'),
      cell: (info) => renderTag(info.getValue() as string),
    },
  ]
}

const columnsInfo = {
  getColumns,
}

export default columnsInfo
