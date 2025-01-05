import { DataTableColumnDef } from '@/components/molecules/DataTable/types'

import { IconButton } from '@/components/atoms/IconButton'
import { FiCheck, FiTrash2, FiX } from 'react-icons/fi'
import { AppCell } from './Cells/AppCell'
import { CompositeCell } from './Cells/CompositeCell'
import { StatusCell } from './Cells/StatusCell'
import { ILinkedAccountsTable, IPlayerCell } from './types'
import { OpenDialog } from '.'

type UseTranslationsReturn = (
  key: string,
  values?: Record<string, string>,
) => string

type ColumnsActions = {
  onOpenDialog: (openDialogParams: OpenDialog) => void
}

const getColumns = (
  t: UseTranslationsReturn,
  columnsActions: ColumnsActions,
): DataTableColumnDef<ILinkedAccountsTable>[] => {
  const { onOpenDialog } = columnsActions

  return [
    {
      id: 'player',
      accessorKey: 'player',
      cell: (info) => <CompositeCell {...(info.getValue() as IPlayerCell)} />,
      header: t(
        'Panel.MyClients.editMyClientDialog.linkedAccounts.tableColumns.0',
      ),
      isVisibleOnMobile: true,
    },
    {
      id: 'app',
      accessorKey: 'app',
      cell: (info) => <AppCell name={info.getValue() as string} />,
      header: t(
        'Panel.MyClients.editMyClientDialog.linkedAccounts.tableColumns.1',
      ),
      isVisibleOnMobile: true,
    },
    {
      id: 'club',
      accessorKey: 'club',
      cell: (info) => <CompositeCell {...(info.getValue() as IPlayerCell)} />,
      header: t(
        'Panel.MyClients.editMyClientDialog.linkedAccounts.tableColumns.2',
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      cell: (info) => <StatusCell status={info.getValue() as boolean} />,
      header: t(
        'Panel.MyClients.editMyClientDialog.linkedAccounts.tableColumns.3',
      ),
    },
    {
      id: 'actions',
      accessorKey: 'id',
      header: t(
        'Panel.MyClients.editMyClientDialog.linkedAccounts.tableColumns.4',
      ),
      cell: (info) => (
        <>
          {info.row.original.status ? (
            <IconButton
              onClick={() =>
                onOpenDialog({ accountId: info.getValue() as number })
              }
              variants="warning"
              icon={<FiTrash2 size={16} className="text-grey-300" />}
            />
          ) : (
            <div className="flex items-center gap-xs">
              <IconButton
                onClick={() => {
                  onOpenDialog({
                    type: 'aprove',
                    accountId: info.getValue() as number,
                  })
                }}
                variants="success"
                icon={<FiCheck size={16} className="text-grey-300" />}
              />
              <IconButton
                onClick={() => {
                  onOpenDialog({
                    type: 'reprove',
                    accountId: info.getValue() as number,
                  })
                }}
                variants="warning"
                icon={<FiX size={16} className="text-grey-300" />}
              />
            </div>
          )}
        </>
      ),
      footer: (props) => props.column.id,
      enableSorting: false,
      isVisibleOnMobile: true,
    },
  ]
}

const info = {
  getColumns,
}

export default info
