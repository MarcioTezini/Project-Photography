import React from 'react'
import { twMerge } from 'tailwind-merge'

const DataTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={twMerge('text-LABEL-L cursor-pointer', className)}
    {...props}
  />
))
DataTableRow.displayName = 'DataTableRow'

export default DataTableRow
