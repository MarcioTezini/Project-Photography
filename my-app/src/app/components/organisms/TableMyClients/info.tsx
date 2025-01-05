import { TableEditButton } from '@/components/atoms/TableEditButton'
import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import { CustomerCell } from './Cells/CustomerCell'
import { GeneralSettingsCell } from './Cells/GeneralSettingsCell'
import { IgnoreWLCell } from './Cells/IgnoreWLCell'
import {
  IClientCell,
  IGeneralSettingsCell,
  IIgnoreWlCell,
  MyClientTable,
} from './type'
import { currencyFormatter } from '@/bosons/formatters/currencyFormatter'

type UseTranslationsReturn = (
  key: string,
  values?: Record<string, string>,
) => string

type ColumnsActions = {
  onEditClient: (id: number) => void
}

const getColumns = (
  t: UseTranslationsReturn,
  columnsActions: ColumnsActions,
): DataTableColumnDef<MyClientTable>[] => {
  const { onEditClient } = columnsActions

  return [
    {
      id: '2',
      accessorKey: 'client',
      header: t('Panel.MyClients.tableColumns.0'),
      cell: (info) => <CustomerCell {...(info.getValue() as IClientCell)} />,
      sortDescFirst: false,
    },
    {
      id: '5',
      accessorKey: 'links',
      header: t('Panel.MyClients.tableColumns.1'),
      sortDescFirst: false,
    },
    {
      id: '13',
      accessorKey: 'registered',
      header: t('Panel.MyClients.tableColumns.7'),
      sortDescFirst: false,
    },
    {
      id: '6',
      accessorKey: 'depositMin',
      header: t('Panel.MyClients.tableColumns.2'),
      cell: (info) => (
        <span>
          {info.getValue() === 'Padrão'
            ? (info.getValue() as string)
            : currencyFormatter.mask(
                String(info.getValue() as string).replace('.', ','),
              )}
        </span>
      ),
      sortDescFirst: false,
    },
    {
      id: '7',
      accessorKey: 'withdrawMax',
      header: t('Panel.MyClients.tableColumns.3'),
      cell: (info) => (
        <span>
          {info.getValue() === 'Padrão'
            ? (info.getValue() as string)
            : currencyFormatter.mask(
                String(info.getValue() as string).replace('.', ','),
              )}
        </span>
      ),
      sortDescFirst: false,
    },
    {
      id: '10',
      accessorKey: 'generalSettings',
      header: t('Panel.MyClients.tableColumns.4'),
      cell: (info) => (
        <GeneralSettingsCell {...(info.getValue() as IGeneralSettingsCell)} />
      ),
      sortDescFirst: false,
    },
    {
      id: '11',
      accessorKey: 'ignoreWl',
      header: t('Panel.MyClients.tableColumns.5'),
      cell: (info) => <IgnoreWLCell {...(info.getValue() as IIgnoreWlCell)} />,
      sortDescFirst: false,
    },
    {
      accessorKey: 'action',
      header: t('Panel.MyClients.tableColumns.6'),
      cell: (info) => (
        <TableEditButton
          name="Editar"
          onClick={() => onEditClient(info.row.original.id)}
        />
      ),
      isVisibleOnMobile: true,
      enableSorting: false,
    },
  ]
}

const info = {
  getColumns,
}

export default info
