import React from 'react'
import { twMerge } from 'tailwind-merge'

const DataTableRoot = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={twMerge('w-full caption-bottom text-sm border-0', className)}
    {...props}
  />
))
DataTableRoot.displayName = 'DataTableRoot'

export default DataTableRoot
