'use client'

import React, { useRef } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import Tab from '@/components/atoms/Tab'

interface TabsProps extends RadixTabs.TabsProps {
  children: React.ReactNode
  tabs: {
    label: string
    value: string
  }[]
}

const Tabs: React.FC<TabsProps> = ({ children, tabs, ...rest }) => {
  const listRef = useRef<HTMLDivElement>(null)

  const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (listRef.current) {
      const button = e.currentTarget
      const buttonRect = button.getBoundingClientRect()
      const listRect = listRef.current.getBoundingClientRect()
      const offset =
        buttonRect.left -
        listRect.left +
        buttonRect.width / 2 -
        listRect.width / 2

      listRef.current.scrollBy({
        left: offset,
        behavior: 'smooth',
      })
    }
  }

  return (
    <RadixTabs.Root {...rest}>
      <RadixTabs.List
        ref={listRef}
        className="flex justify-between overflow-x-auto w-full"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            onClick={handleTabClick}
          />
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  )
}

export default Tabs
