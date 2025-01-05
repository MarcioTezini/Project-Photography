import React from 'react'
import { twMerge } from 'tailwind-merge'

const DataTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={twMerge('p-xs text-grey-800 ', className)}
    {...props}
  />
))
DataTableCell.displayName = 'DataTableCell'

export default DataTableCell
