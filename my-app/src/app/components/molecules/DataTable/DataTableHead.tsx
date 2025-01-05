import React from 'react'
import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'

const DataTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const getStyles = tv({
    slots: {
      th: 'bg-grey-700 p-xs text-left text-grey-300 first:rounded-tl-sm last:rounded-tr-sm border-0',
    },
  })

  const { th } = getStyles()

  return <th ref={ref} className={twMerge(th(), className)} {...props} />
})
DataTableHead.displayName = 'DataTableHead'

export default DataTableHead
