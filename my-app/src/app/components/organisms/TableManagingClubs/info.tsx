import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import { Club, LogoClub, ManigingClubsTable } from './type'
import Tag from '@/components/atoms/Tag'
import { TableEditButton } from '@/components/atoms/TableEditButton'
import { ClubCell } from './Cells/CustomerCell/ClubCell'
import { LogoClubCell } from './Cells/CustomerCell/LogoClubCell'

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

const renderTag = (value: number | null | undefined) => {
  const appNames: Record<number, { name: string; variant: TagVariant }> = {
    1: { name: 'Suprema Poker', variant: 'poker' },
    2: { name: 'Cacheta League', variant: 'cacheta' },
  }

  if (value && appNames[value]) {
    const { name, variant } = appNames[value]
    return <Tag variant={variant}>{name}</Tag>
  }

  return null
}

export const getColumns = (
  t: UseTranslationsReturn,
  reloadData: () => void,
  setOpenUpdateClubDialog: (open: boolean) => void,
  setSelectedClubId: (id: number) => void,
): DataTableColumnDef<ManigingClubsTable>[] => {
  return [
    {
      id: '2',
      accessorKey: 'logo',
      header: t('Panel.ManagingClubs.tableColumns.0'),
      cell: (info) => <LogoClubCell {...(info.getValue() as LogoClub)} />,
      sortDescFirst: false,
    },
    {
      id: '4',
      accessorKey: 'app',
      header: t('Panel.ManagingClubs.tableColumns.1'),
      cell: (info) => renderTag(info.getValue() as number),
      sortDescFirst: false,
    },
    {
      id: '5',
      accessorKey: 'club',
      header: t('Panel.ManagingClubs.tableColumns.2'),
      cell: (info) => <ClubCell {...(info.getValue() as Club)} />,
      sortDescFirst: false,
    },
    {
      id: '7',
      accessorKey: 'operatorID',
      header: t('Panel.ManagingClubs.tableColumns.3'),
      cell: (info) => renderLabel(info.getValue()?.toString()),
      sortDescFirst: false,
    },
    {
      id: '8',
      accessorKey: 'agentID',
      header: t('Panel.ManagingClubs.tableColumns.4'),
      cell: (info) => renderLabel(info.getValue()?.toString()),
      sortDescFirst: false,
    },
    {
      id: '9',
      accessorKey: 'default',
      header: t('Panel.ManagingClubs.tableColumns.5'),
      cell: (info) => {
        const value = info.getValue() as number
        const label = value === 1 ? 'Sim' : 'Não'
        return renderLabel(label)
      },
      sortDescFirst: false,
    },
    {
      accessorKey: 'actions',
      header: t('Panel.ManagingClubs.tableColumns.6'),
      cell: (info) => {
        const id = info.row.original.id
        return (
          <div className="flex gap-xs">
            <TableEditButton
              name="Editar"
              onClick={() => {
                setSelectedClubId(id)
                setOpenUpdateClubDialog(true)
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
