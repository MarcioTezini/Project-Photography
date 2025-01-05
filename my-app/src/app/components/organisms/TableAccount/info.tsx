import { useState, useEffect } from 'react'
import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import { AccountTable } from './type'
import Tag from '@/components/atoms/Tag'
import Switch from '@/components/atoms/Switch'
import { showToast } from '@/components/atoms/Toast'
import { updateStatusAccount } from '@/services/account/account'
import { useSwitchStore } from '@/stores/SwitchStore'

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

const renderTag = (value: number | string | null | undefined) => {
  const tagMappings: Record<number, { label: string; variant: TagVariant }> = {
    1: { label: 'Ativo', variant: 'success' },
    0: { label: 'Inativo', variant: 'warning' },
  }

  if (typeof value === 'number' && tagMappings[value]) {
    const { label, variant } = tagMappings[value]
    return <Tag variant={variant}>{label}</Tag>
  }

  return null
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
  const [localChecked, setLocalChecked] = useState(value === 1 || value === '1')
  const [isLoading, setIsLoading] = useState(false)
  const { switchStates, setSwitchState } = useSwitchStore()

  useEffect(() => {
    setLocalChecked(switchStates[id] ?? (value === 1 || value === '1'))
  }, [value, switchStates, id])

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    if (isLoading) return

    setIsLoading(true)
    try {
      await updateStatusAccount(id, { status: checked ? 1 : 0 })

      setLocalChecked(checked)
      setSwitchState(id, checked)

      const successMessage = checked
        ? t('Panel.Account.registerSuccess')
        : t('Panel.Account.removeAccount')

      showToast('success', successMessage, 5000, 'bottom-left')
      onSwitchChange()
    } catch (error) {
      console.error('Error updating Account:', error)
      showToast('error', t('Panel.Account.updateFailed'), 5000, 'bottom-left')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Switch
      checked={localChecked}
      onChange={handleChange}
      disabled={isLoading}
    />
  )
}

export const getColumns = (
  t: UseTranslationsReturn,
  onSwitchChange: () => void,
): DataTableColumnDef<AccountTable>[] => {
  return [
    {
      id: '4',
      accessorKey: 'name',
      header: t('Panel.Account.tableColumns.0'),
      cell: (info) => renderLabel(info.getValue() as string),
    },
    {
      id: '5',
      accessorKey: 'status',
      header: t('Panel.Account.tableColumns.1'),
      cell: (info) => renderTag(info.getValue() as string),
    },
    {
      id: '5',
      accessorKey: 'status',
      header: t('Panel.Account.tableColumns.2'),
      cell: (info) => (
        <RenderSwitch
          value={info.getValue() as string | number}
          id={info.row.original.id as number}
          onSwitchChange={onSwitchChange}
          t={t}
        />
      ),
    },
  ]
}

const columnsInfo = {
  getColumns,
}

export default columnsInfo
