import React from 'react'
import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'

const DataTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const getStyles = tv({
    slots: {
      thead: 'bg-grey-700 text-BODY-S',
    },
  })

  const { thead } = getStyles()

  return <thead ref={ref} className={twMerge(thead(), className)} {...props} />
})
DataTableHeader.displayName = 'DataTableHeader'

export default DataTableHeader
