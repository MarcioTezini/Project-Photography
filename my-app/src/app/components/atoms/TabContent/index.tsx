import React from 'react'

import * as RadixTabs from '@radix-ui/react-tabs'

interface TabContentProps extends RadixTabs.TabsContentProps {
  children: React.ReactNode
}

const TabContent: React.FC<TabContentProps> = ({ children, ...rest }) => {
  return <RadixTabs.Content {...rest}>{children}</RadixTabs.Content>
}

export default TabContent
