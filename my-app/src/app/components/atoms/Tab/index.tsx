'use client'

import React from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'

interface TabProps extends RadixTabs.TabsTriggerProps {
  label: string
}

const Tab: React.FC<TabProps> = ({ label, ...rest }) => {
  const tabStyles = `
    text-nowrap
    relative
    flex
    flex-col
    items-start
    px-xs
    py-xxs
    text-BODY-XM
    font-Regular
    text-grey-700
    hover:text-fichasPay-main-400
    data-[state=active]:text-grey-900
    data-[state=active]:font-Bold
    after:content-['']
    after:mt-xs
    after:relative
    after:w-full
    after:h-[4px]
    after:bg-fichasPay-main-400
    after:rounded-xs
    after:hidden
    data-[state=active]:after:block
  `

  return (
    <RadixTabs.Trigger className={tabStyles} {...rest}>
      {label}
    </RadixTabs.Trigger>
  )
}

export default Tab
