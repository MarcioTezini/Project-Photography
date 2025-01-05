import Switch from '@/components/atoms/Switch'
import { Tooltip } from '@/components/atoms/Tooltip'
import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { FiAlertCircle } from 'react-icons/fi'

interface SettingsOptionProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  title: string
  tooltipMessage?: string | React.ReactNode
}

export const SettingsOption: React.FC<SettingsOptionProps> = ({
  title,
  tooltipMessage,
  ...rest
}) => {
  return (
    <div className="flex items-center justify-between py-xs border-b-[0.5px] border-grey-600">
      <div className="flex items-center gap-xxs">
        <p className="text-BODY-XM text-grey-700 font-Regular">{title}</p>
        <TooltipPrimitive.Provider>
          <Tooltip
            content={<p>{tooltipMessage}</p>}
            defaultOpen={false}
            contentMarginLeft="100px"
          >
            <FiAlertCircle className="w-6 h-6 text-grey-600 cursor-pointer" />
          </Tooltip>
        </TooltipPrimitive.Provider>
      </div>
      <Switch {...rest} />
    </div>
  )
}
