import Button from '@/components/atoms/Button'
import Tag from '@/components/atoms/Tag'
import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import { FiEye } from 'react-icons/fi'
import { ExtractClientCell } from './Cells/ClientCell'
import { ExtractClubCell } from './Cells/ClubCelll'
import { ExtractDateCell } from './Cells/DateCell'
import { ExtractPlayerCell } from './Cells/PlayerCell'
import {
  ClientExtract,
  ClubExtract,
  DateExtract,
  ExtractTable,
  PlayerExtract,
} from './type'

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

type ColumnsActions = {
  onExtractInfo: (id: number) => void
}

const renderLabel = (value: string | null | undefined) => (
  <label className="py-s text-LABEL-L font-Medium text-grey-800">
    {value ? value.toString() : ''}
  </label>
)

const statusMapString: Record<string, string> = {
  deposit: 'Depósito',
  withdraw: 'Saque',
}

const statusMap: Record<number, string> = {
  0: 'Em Andamento',
  1: 'Erro (Aguarde)',
  2: 'Concluído',
  6: 'Processando',
  9: 'Cancelado',
  7: 'Estornado',
  8: 'Estornado',
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
    Concluído: 'success',
    Cancelado: 'warning',
    'Em Andamento': 'alert',
    'Erro (Aguarde)': 'warning',
    Processando: 'info',
    Estornado: 'default',
    Expirado: 'default',
  }

  const variant = label ? variants[label] : undefined
  return variant ? <Tag variant={variant}>{label}</Tag> : null
}

export const getColumns = (
  t: UseTranslationsReturn,
  columnsActions: ColumnsActions,
): DataTableColumnDef<ExtractTable>[] => {
  const { onExtractInfo } = columnsActions

  return [
    {
      id: '1',
      accessorKey: 'id',
      sortDescFirst: false,
      isVisibleOnMobile: true,
      header: 'ID',
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '2',
      accessorKey: 'date',
      sortDescFirst: false,
      header: t('Panel.Extract.tableColumns.0'),
      cell: (info) => <ExtractDateCell {...(info.getValue() as DateExtract)} />,
    },
    {
      id: '15',
      accessorKey: 'type',
      sortDescFirst: false,
      header: t('Panel.Extract.tableColumns.1'),
      cell: (info) => renderTag(info.getValue() as string),
    },
    {
      id: '5',
      accessorKey: 'client',
      sortDescFirst: false,
      header: t('Panel.Extract.tableColumns.2'),
      cell: (info) => (
        <ExtractClientCell {...(info.getValue() as ClientExtract)} />
      ),
    },
    {
      id: '11',
      accessorKey: 'player',
      sortDescFirst: false,
      header: t('Panel.Extract.tableColumns.3'),
      cell: (info) => (
        <ExtractPlayerCell {...(info.getValue() as PlayerExtract)} />
      ),
    },
    {
      id: '9',
      accessorKey: 'club',
      sortDescFirst: false,
      header: t('Panel.Extract.tableColumns.4'),
      cell: (info) => <ExtractClubCell {...(info.getValue() as ClubExtract)} />,
    },
    {
      id: '7',
      accessorKey: 'appName',
      sortDescFirst: false,
      header: t('Panel.Extract.tableColumns.5'),
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
      id: '3',
      accessorKey: 'amount',
      sortDescFirst: false,
      isVisibleOnMobile: true,
      header: t('Panel.Extract.tableColumns.6'),
      cell: (info) => {
        const value = info.getValue() as number
        const formattedValue =
          value < 0
            ? `- R$ ${Math.abs(value).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : `+ R$ ${Math.abs(value).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
        return (
          <span className="py-s text-LABEL-L font-Medium">
            {formattedValue}
          </span>
        )
      },
    },
    {
      id: '14',
      accessorKey: 'status',
      sortDescFirst: false,
      header: t('Panel.Extract.tableColumns.7'),
      cell: (info) => renderTag(info.getValue() as string),
    },
    {
      id: '10',
      accessorKey: 'action',
      enableSorting: false,
      isVisibleOnMobile: true,
      header: t('Panel.Extract.tableColumns.8'),
      cell: (info) => (
        <Button onClick={() => onExtractInfo(info.row.original.id)}>
          <FiEye />
        </Button>
      ),
    },
  ]
}

const columnsInfo = {
  getColumns,
}

export default columnsInfo
