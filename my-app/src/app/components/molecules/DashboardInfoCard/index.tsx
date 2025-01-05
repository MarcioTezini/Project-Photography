import React from 'react'
import Divider from '@/components/atoms/Divider'
import { tv } from 'tailwind-variants'

interface DashboardInfoCardProps {
  preIcon: React.ReactNode
  text: string
  type?: 'default' | 'info' | 'success' | 'warning' | 'alert'
  value: number
  valueType?: 'default' | 'currency' | 'percent'
  addPrefix?: boolean
  isNegative?: boolean
}

const iconStyles = tv({
  variants: {
    color: {
      default: 'text-grey-700',
      info: 'text-notify-info-dark',
      success: 'text-notify-success-dark',
      warning: 'text-notify-warning-dark',
      alert: 'text-notify-alert-dark',
    },
  },
})

const signStyles = tv({
  variants: {
    color: {
      default: 'text-grey-700',
      info: 'text-notify-info-dark',
      success: 'text-notify-success-dark',
      warning: 'text-notify-warning-dark',
      alert: 'text-notify-alert-dark',
    },
  },
})

export default function DashboardInfoCard({
  preIcon,
  text,
  type = 'default',
  value,
  valueType = 'default',
  addPrefix = false,
  isNegative = false,
}: DashboardInfoCardProps) {
  const getFormattedValue = (): React.ReactNode => {
    const sign = isNegative || value < 0 ? '-' : value > 0 ? '+' : ''
    const shouldAddSign = addPrefix || valueType === 'currency'

    switch (valueType) {
      case 'currency': {
        const formattedCurrency = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(Math.abs(value))

        return (
          <>
            {shouldAddSign && (
              <span className={signStyles({ color: type })}>{sign}</span>
            )}
            {formattedCurrency}
          </>
        )
      }

      case 'percent':
        return (
          <>
            {shouldAddSign && (
              <span className={signStyles({ color: type })}>{sign}</span>
            )}
            {`${value}%`}
          </>
        )

      default:
        return (
          <>
            {shouldAddSign && (
              <span className={signStyles({ color: type })}>{sign}</span>
            )}
            {value.toString()}
          </>
        )
    }
  }

  return (
    <div className="flex flex-col p-s gap-s items-start self-stretch w-full bg-grey-300 rounded-sm shadow-DShadow-S">
      <div className="flex items-center justify-between gap-xs self-stretch">
        <div className="flex items-center gap-xxs">
          <div className={iconStyles({ color: type })}>{preIcon}</div>
          <label className="text-BODY-S font-Regular text-grey-900">
            {text}
          </label>
        </div>
        <span className="text-H6 text-right font-Regular text-grey-900">
          {getFormattedValue()}
        </span>
      </div>
      <Divider />
    </div>
  )
}
