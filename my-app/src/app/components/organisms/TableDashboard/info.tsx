import Tag from '@/components/atoms/Tag'
import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import { DashboardTable, ITransactionUser } from './type'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type UseTranslationsReturn = (
  key: string,
  values?: Record<string, string>,
) => string

const getColumns = (
  t: UseTranslationsReturn,
): DataTableColumnDef<DashboardTable>[] => {
  return [
    {
      id: '1',
      accessorKey: 'id',
      header: t('tableColumns.id'),
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
      isVisibleOnMobile: true,
    },
    {
      id: '2',
      accessorKey: 'dateTime',
      header: t('tableColumns.dateTime'),
      cell: (info) => {
        const value = info.getValue()
        if (value) {
          const formattedDate = format(
            new Date(value.toString()),
            "dd/MM/yyyy 'às' HH:mm:ss",
            { locale: ptBR },
          )
          return (
            <label className="text-LABEL-L font-Medium text-grey-800">
              {formattedDate}
            </label>
          )
        }
      },
      sortDescFirst: false,
    },
    {
      id: '3',
      accessorKey: 'user',
      header: t('tableColumns.user'),
      cell: (info) => {
        const value = info.getValue() as ITransactionUser
        if (value) {
          return (
            <div className="flex flex-col justify-center items-start self-stretch">
              <label className="text-grey-800 text-LABEL-L font-Medium truncate">
                {value.name}
              </label>
              <label className="text-notify-info-normal text-LABEL-L font-Medium truncate">
                {value.document}
              </label>
            </div>
          )
        }
      },
      sortDescFirst: false,
    },
    {
      id: '5',
      accessorKey: 'type',
      header: t('tableColumns.type'),
      cell: (info) => {
        const value = info.getValue()
        if (value) {
          if (value === 'deposit') {
            return <Tag variant="success">{t('deposit')}</Tag>
          } else if (value === 'withdraw') {
            return <Tag variant="warning">{t('withdraw')}</Tag>
          }
        }
      },
      sortDescFirst: false,
    },
    {
      id: '6',
      accessorKey: 'value',
      header: t('tableColumns.value'),
      cell: (info) => {
        const rawValue = info.getValue()
        const value = typeof rawValue === 'number' ? rawValue : Number(rawValue)

        if (!isNaN(value)) {
          const formattedValue = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            signDisplay: 'never',
          }).format(Math.abs(value))
          const color =
            value < 0
              ? 'text-notify-warning-normal'
              : 'text-notify-success-normal'
          const sign = value < 0 ? '-' : '+'

          return (
            <label className={`truncate text-LABEL-L font-Medium`}>
              <span className={color}>{sign}</span>
              {formattedValue}
            </label>
          )
        }
      },
      sortDescFirst: false,
    },
  ]
}

const info = {
  getColumns,
}

export default info
