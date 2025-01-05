import React from 'react'
import { twMerge } from 'tailwind-merge'

const DataTableFooter = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge('mt-xm text-grey-800 ', className)}
    {...props}
  />
))

DataTableFooter.displayName = 'DataTableFooter'

export default DataTableFooter
