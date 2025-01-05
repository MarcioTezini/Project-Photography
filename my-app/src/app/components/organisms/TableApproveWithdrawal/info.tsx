import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import {
  ApproveWithdrawalId,
  Club,
  DateApproveWithdrawal,
  Player,
  User,
  ValueApprove,
} from './type'
import { UserCell } from './Cells/CustomerCell/UserCell'
import { DateApproveWithdrawalCell } from './Cells/CustomerCell/DateCell'
import { ValueCell } from './Cells/CustomerCell/ValueCell'
import { PlayerCell } from './Cells/CustomerCell/PlayerCell'
import { ClubCell } from './Cells/CustomerCell/ClubCell'
import Tag from '@/components/atoms/Tag'
import { TableWarningButton } from '@/components/atoms/TableWarningButton'
import { FiX } from 'react-icons/fi'
import { TableSucessButton } from '@/components/atoms/TableSucessButton'

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
  'Suprema Poker': 'Suprema Poker',
  'Cacheta League': 'Cacheta League',
}

const renderTag = (value: string | '') => {
  const label = typeof value === 'string' ? statusMapString[value] : value

  const variants: Record<string, TagVariant> = {
    'Suprema Poker': 'poker',
    'Cacheta League': 'cacheta',
  }

  const variant = label ? variants[label] : undefined
  return variant ? <Tag variant={variant}>{label}</Tag> : null
}

export const getColumns = (
  t: UseTranslationsReturn,
  setSelectedId: (id: number) => void,
  setPlayerNickDialog: (playerNickDialog: string) => void,
  setOpenRemovePlayerDialog: (open: boolean) => void,
  setOpenApprovePlayerDialog: (open: boolean) => void,
): DataTableColumnDef<ApproveWithdrawalId>[] => {
  return [
    {
      id: '1',
      accessorKey: 'id',
      sortDescFirst: false,
      header: 'ID',
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '2',
      accessorKey: 'dates',
      sortDescFirst: false,
      header: t('Panel.Dashboard.tableColumns.dateTime'),
      cell: (info) => (
        <DateApproveWithdrawalCell
          {...(info.getValue() as DateApproveWithdrawal)}
        />
      ),
    },
    {
      id: '5',
      accessorKey: 'users',
      sortDescFirst: false,
      header: t('Panel.MyClients.tableColumns.0'),
      cell: (info) => <UserCell {...(info.getValue() as User)} />,
    },
    {
      id: '11',
      accessorKey: 'players',
      sortDescFirst: false,
      header: t(
        'Panel.MyClients.editMyClientDialog.linkedAccounts.tableColumns.0',
      ),
      cell: (info) => <PlayerCell {...(info.getValue() as Player)} />,
    },
    {
      id: '9',
      accessorKey: 'clubs',
      sortDescFirst: false,
      header: t(
        'Panel.MyClients.editMyClientDialog.linkedAccounts.tableColumns.2',
      ),
      cell: (info) => <ClubCell {...(info.getValue() as Club)} />,
    },
    {
      id: '7',
      accessorKey: 'appName',
      sortDescFirst: false,
      header: 'APP',
      cell: (info) => renderTag(info.getValue() as string),
    },
    {
      id: '3',
      accessorKey: 'amounts',
      sortDescFirst: false,
      header: t('Panel.Dashboard.tableColumns.value'),
      cell: (info) => <ValueCell {...(info.getValue() as ValueApprove)} />,
    },
    {
      id: 'action',
      isVisibleOnMobile: true,
      header: t('Panel.MyClients.tableColumns.6'),
      cell: (info) => {
        const id = info.row.original.id
        const playerNickDialog = info.row.original.players.playerNick
        return (
          <div className="flex gap-xs">
            <TableSucessButton
              name=""
              onClick={() => {
                setSelectedId(id)
                setPlayerNickDialog(playerNickDialog)
                setOpenApprovePlayerDialog(true)
              }}
            />
            <TableWarningButton
              name=""
              icon={<FiX size={16} className="text-grey-300" />}
              onClick={() => {
                setSelectedId(id)
                setPlayerNickDialog(playerNickDialog)
                setOpenRemovePlayerDialog(true)
              }}
            />
          </div>
        )
      },
    },
  ]
}

const columnsInfo = {
  getColumns,
}

export default columnsInfo
