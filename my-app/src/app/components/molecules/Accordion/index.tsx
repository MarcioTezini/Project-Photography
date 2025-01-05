'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { ChevronUpIcon } from '@radix-ui/react-icons'

interface PanelAccordionProps {
  title: string
  headerContent?: React.ReactNode
  children: React.ReactNode
  open: boolean // Estado controlado externamente
  onChange: (isOpen: boolean) => void // Função para alterar o estado externamente
}

export function PanelAccordion({
  title,
  headerContent,
  children,
  open,
  onChange,
}: PanelAccordionProps) {
  const handleAccordionChange = (value: string) => {
    onChange(value === 'item-1')
  }

  return (
    <Accordion.Root
      collapsible
      type="single"
      className="w-full"
      onValueChange={handleAccordionChange}
      value={open ? 'item-1' : ''}
    >
      <Accordion.Item value="item-1">
        <Accordion.Header className="flex w-full justify-between items-center bg-grey-300 p-s">
          <div className="flex items-center gap-xs text-grey-800 text-BODY-M font-Regular">
            {title}
            {headerContent}
          </div>
          <Accordion.Trigger>
            <ChevronUpIcon
              width={24}
              height={24}
              className={`${open ? 'rotate-180 text-fichasPay-main-400' : 'rotate-0'}`}
            />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>{children}</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  )
}
