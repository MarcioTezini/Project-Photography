import { TableEditButton } from '@/components/atoms/TableEditButton'
import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import { EmployeesTable, IEmployeeCell } from './type'
import { EmployeeCell } from './Cells/EmployeeCell'
import Tag from '@/components/atoms/Tag'
import { UserData } from '@/services/auth/login'

type UseTranslationsReturn = (
  key: string,
  values?: Record<string, string>,
) => string

const getColumns = (
  t: UseTranslationsReturn,
  setOpenUpdateCarouselDialog: (open: boolean) => void,
  setSelectedEmployeeId: (id: number) => void,
  me: UserData,
): DataTableColumnDef<EmployeesTable>[] => {
  const employeeId = me.user?.id
  return [
    {
      id: '2',
      accessorKey: 'employeeInfo',
      header: t('Panel.Employees.tableColumns.0'),
      cell: (info) => <EmployeeCell {...(info.getValue() as IEmployeeCell)} />,
      sortDescFirst: false,
    },
    {
      id: '4',
      accessorKey: 'email',
      header: t('Panel.Employees.tableColumns.1'),
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
      priority: 1,
      sortDescFirst: false,
    },
    {
      id: '5',
      accessorKey: 'phone',
      priority: 2,
      header: t('Panel.Employees.tableColumns.2'),
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
      id: '6',
      accessorKey: 'function',
      priority: 3,
      header: t('Panel.Employees.tableColumns.3'),
      cell: (info) => {
        const value = info.getValue()
        return value === 1
          ? t('Panel.Employees.role.1')
          : t('Panel.Employees.role.0')
      },
      sortDescFirst: false,
    },
    {
      id: '7',
      accessorKey: 'status',
      header: t('Panel.Employees.tableColumns.4'),
      cell: (info) => {
        const value = info.getValue()
        if (value === 1) {
          return <Tag variant="success">{t('Panel.Employees.status.1')}</Tag>
        } else {
          return <Tag variant="warning">{t('Panel.Employees.status.0')}</Tag>
        }
      },
      sortDescFirst: false,
    },
    {
      id: 'action',
      header: t('Panel.Employees.tableColumns.5'),
      cell: (info) => {
        const id = info.row.original.id
        if (id === employeeId) return <></>
        return (
          <TableEditButton
            name={t('Panel.Employees.editButton')}
            onClick={() => {
              setSelectedEmployeeId(id)
              setOpenUpdateCarouselDialog(true)
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
