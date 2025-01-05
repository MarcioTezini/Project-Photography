import Tag from '@/components/atoms/Tag'
import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import { ChipsTable, ClubChips, DateChip, PlayerChips } from './type'
import { ChipsDateCell } from './Cells/DateCell'
import { ChipsClubCell } from './Cells/ClubCell'
import { ChipsPlayerCell } from './Cells/PlayerCell'
import { ChipsValueCell } from './Cells/ValueCell'

type UseTranslationsReturn = (
  key: string,
  values?: Record<string, string>,
) => string

const renderLabel = (value: string | null | undefined) => (
  <label className="text-LABEL-L font-Medium text-grey-800">
    {value ? value.toString() : ''}
  </label>
)

export const getColumns = (
  t: UseTranslationsReturn,
): DataTableColumnDef<ChipsTable>[] => {
  return [
    {
      id: '1',
      accessorKey: 'id',
      sortDescFirst: false,
      isVisibleOnMobile: true,
      header: t('Panel.ChipsManagement.tableColumns.ID'),
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '2',
      accessorKey: 'date',
      sortDescFirst: false,
      isVisibleOnMobile: false,
      header: t('Panel.ChipsManagement.tableColumns.dateTime'),
      cell: (info) => <ChipsDateCell {...(info.getValue() as DateChip)} />,
    },
    {
      id: '3',
      accessorKey: 'username',
      sortDescFirst: false,
      header: t('Panel.ChipsManagement.tableColumns.operator'),
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '4',
      accessorKey: 'appname',
      sortDescFirst: false,
      header: t('Panel.ChipsManagement.tableColumns.app'),
      cell: (info) => {
        const value = info.getValue()
        if (value === 'Suprema Poker') {
          return <Tag variant="poker">{value}</Tag>
        } else if (value === 'Cacheta League') {
          return <Tag variant="cacheta">{value}</Tag>
        }
      },
    },
    {
      id: '6',
      accessorKey: 'club',
      sortDescFirst: false,
      header: t('Panel.ChipsManagement.tableColumns.club'),
      cell: (info) => <ChipsClubCell {...(info.getValue() as ClubChips)} />,
    },
    {
      id: '8',
      accessorKey: 'player',
      sortDescFirst: false,
      isVisibleOnMobile: true,
      header: t('Panel.ChipsManagement.tableColumns.player'),
      cell: (info) => <ChipsPlayerCell {...(info.getValue() as PlayerChips)} />,
    },
    {
      id: '9',
      accessorKey: 'bankname',
      sortDescFirst: false,
      header: t('Panel.ChipsManagement.tableColumns.account'),
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '11',
      accessorKey: 'value',
      sortDescFirst: false,
      isVisibleOnMobile: true,
      header: t('Panel.ChipsManagement.tableColumns.value'),
      cell: (info) => <ChipsValueCell value={info.getValue() as number} />,
    },
  ]
}

const columnsInfo = {
  getColumns,
}

export default columnsInfo
