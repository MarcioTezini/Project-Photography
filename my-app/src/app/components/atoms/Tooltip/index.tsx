import React, { useState } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  tooltipIconClassname?: string
  contentMarginLeft?: string
  contentMarginRight?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  className,
  tooltipIconClassname,
  contentMarginLeft = '0px',
  contentMarginRight = '0px',
  side = 'top',
  ...props
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (onOpenChange) {
      onOpenChange(open)
    }
  }

  return (
    <TooltipPrimitive.Root
      open={open !== undefined ? open : isOpen}
      onOpenChange={handleOpenChange}
      delayDuration={0}
    >
      <TooltipPrimitive.Trigger asChild>
        <div
          onClick={() => handleOpenChange(!isOpen)}
          className="cursor-pointer"
        >
          {React.cloneElement(children as React.ReactElement, {
            className: `${(children as React.ReactElement).props.className} ${isOpen ? 'text-notify-info-normal' : 'text-grey-600'} ${tooltipIconClassname}`,
          })}
        </div>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        side={side}
        align="center"
        className={`bg-grey-500 w-[144px] p-s z-20 text-LABEL-L text-grey-900 text-center rounded-xs font-Medium leading-3 ${className}`}
        style={{
          marginLeft: contentMarginLeft,
          marginRight: contentMarginRight,
        }}
        {...props}
      >
        {content}
        <TooltipPrimitive.Arrow
          className="fill-grey-500"
          width={11}
          height={5}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  )
}
