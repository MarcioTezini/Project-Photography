import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import { WhitelistTable } from './type'
import Tag from '@/components/atoms/Tag'
import { TableEditButton } from '@/components/atoms/TableEditButton'
import { TableWarningButton } from '@/components/atoms/TableWarningButton'
import Switch from '@/components/atoms/Switch'
import { updateAutoWhitelist } from '@/services/agent/agent'
import { showToast } from '@/components/atoms/Toast'

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

const renderTag = (value: string | null | undefined) => {
  const variants: Record<string, TagVariant> = {
    'Suprema Poker': 'poker',
    'Cacheta League': 'cacheta',
  }
  const variant = value ? variants[value] : undefined
  return variant ? <Tag variant={variant}>{value}</Tag> : null
}

const RenderSwitch = ({
  value,
  id,
  onSwitchChange,
  t,
}: {
  value: string | number
  id: number
  onSwitchChange: () => void
  t: UseTranslationsReturn
}) => {
  const toChecked = (val: string | number): boolean => {
    return val === 1 || val === '1'
  }

  const isChecked = toChecked(value)

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    const newValue = checked ? 1 : 0
    try {
      await updateAutoWhitelist({ id, autoApproved: newValue })
      showToast(
        'success',
        t('Panel.Whitelist.FormWhitelist.agentUpdate'),
        5000,
        'bottom-left',
      )
      onSwitchChange()
    } catch (error) {
      console.error('Error updating AutoApproved:', error)
    }
  }

  return <Switch checked={isChecked} onChange={handleChange} />
}

export const getColumns = (
  t: UseTranslationsReturn,
  onSwitchChange: () => void,
  setOpenRemoveAgentDialog: (open: boolean) => void,
  setOpenUpdateAgentDialog: (open: boolean) => void,
  setSelectedAgentId: (id: number) => void,
): DataTableColumnDef<WhitelistTable>[] => {
  return [
    {
      id: '2',
      accessorKey: 'app',
      header: t('Panel.Whitelist.tableColumns.0'),
      cell: (info) => renderTag(info.getValue() as string),
    },
    {
      id: '3',
      accessorKey: 'clubId',
      header: t('Panel.Whitelist.tableColumns.1'),
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '4',
      accessorKey: 'agentId',
      header: t('Panel.Whitelist.tableColumns.2'),
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '5',
      accessorKey: 'agentName',
      header: t('Panel.Whitelist.tableColumns.3'),
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '6',
      accessorKey: 'autoapproved',
      header: t('Panel.Whitelist.tableColumns.4'),
      cell: (info) => (
        <RenderSwitch
          value={info.getValue() as string | number}
          id={info.row.original.id as number}
          onSwitchChange={onSwitchChange}
          t={t}
        />
      ),
    },
    {
      accessorKey: 'actions',
      header: t('Panel.Whitelist.tableColumns.5'),
      cell: (info) => {
        const id = info.row.original.id
        return (
          <div className="flex gap-xs">
            <TableEditButton
              name=""
              onClick={() => {
                setSelectedAgentId(id)
                setOpenUpdateAgentDialog(true)
              }}
            />
            <TableWarningButton
              name=""
              onClick={() => {
                setSelectedAgentId(id)
                setOpenRemoveAgentDialog(true)
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
