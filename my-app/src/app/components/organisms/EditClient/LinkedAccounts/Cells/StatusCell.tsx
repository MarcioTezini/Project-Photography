import { useTranslations } from 'next-intl'
import React from 'react'

export interface StatusCellProps {
  status: boolean
}

export const StatusCell: React.FC<StatusCellProps> = ({ status }) => {
  const t = useTranslations()
  const color = status
    ? 'bg-a-green-50 text-notify-success-darkest'
    : 'bg-a-yellow-50 text-notify-alert-darkest'

  return (
    <div
      className={`w-fit rounded-md text-grey-900 text-LABEL-L font-Bold py-xxs px-xs ${color}`}
    >
      {status
        ? t('Panel.MyClients.editMyClientDialog.status.0')
        : t('Panel.MyClients.editMyClientDialog.status.1')}
    </div>
  )
}
