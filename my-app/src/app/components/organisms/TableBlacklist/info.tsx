import Tag from '@/components/atoms/Tag'
import { TableWarningButton } from '@/components/atoms/TableWarningButton'
import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import { BlacklistTable } from './type'

type UseTranslationsReturn = (
  key: string,
  values?: Record<string, string>,
) => string

const getColumns = (
  t: UseTranslationsReturn,
  setOpenRemovePlayerDialog: (open: boolean) => void,
  setSelectedPlayerId: (id: number) => void,
): DataTableColumnDef<BlacklistTable>[] => {
  return [
    {
      id: '2',
      accessorKey: 'app',
      header: t('Panel.Blacklist.tableColumns.0'),
      priority: 4,
      cell: (info) => {
        const value = info.getValue()
        if (value === 'Suprema Poker') {
          return <Tag variant="poker">{value}</Tag>
        } else if (value === 'Cacheta League') {
          return <Tag variant="cacheta">{value}</Tag>
        }
      },
      sortDescFirst: false,
    },
    {
      id: '3',
      accessorKey: 'clubId',
      header: t('Panel.Blacklist.tableColumns.1'),
      priority: 2,
      cell: (info) => {
        const value = info.getValue()
        if (value) {
          return (
            <label className="text-LABEL-L font-Medium text-grey-800">
              {value.toString()}
            </label>
          )
        }
      },
      sortDescFirst: false,
    },
    {
      id: '4',
      accessorKey: 'playerId',
      header: t('Panel.Blacklist.tableColumns.2'),
      priority: 1,
      cell: (info) => {
        const value = info.getValue()
        if (value) {
          return (
            <label className="text-LABEL-L font-Medium text-grey-800">
              {value.toString()}
            </label>
          )
        }
      },
      sortDescFirst: false,
    },
    {
      id: '5',
      accessorKey: 'playerName',
      header: t('Panel.Blacklist.tableColumns.3'),
      priority: 3,
      cell: (info) => {
        const value = info.getValue()
        if (value) {
          return (
            <label className="text-LABEL-L font-Medium text-grey-800 sm:max-w-[180px] truncate">
              {value.toString()}
            </label>
          )
        }
      },
      sortDescFirst: false,
    },
    {
      id: 'action',
      header: t('Panel.Blacklist.tableColumns.4'),
      priority: 5,
      cell: (info) => {
        const id = info.row.original.id
        return (
          <TableWarningButton
            name={t('Panel.Blacklist.warningButton')}
            onClick={() => {
              setSelectedPlayerId(id)
              setOpenRemovePlayerDialog(true)
            }}
          />
        )
      },
      isVisibleOnMobile: true,
      enableSorting: false,
    },
  ]
}

const info = {
  getColumns,
}

export default info
