import React from 'react'
import { twMerge } from 'tailwind-merge'

const DataTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={twMerge('border border-solid border-grey-500', className)}
    {...props}
  />
))

DataTableBody.displayName = 'DataTableBody'

export default DataTableBody
