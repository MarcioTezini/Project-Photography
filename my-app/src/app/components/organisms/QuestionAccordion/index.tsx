'use client'

import * as Accordion from '@radix-ui/react-accordion'
import Image from 'next/image'
import { useState } from 'react'

interface QuestionAccordionProps {
  title: string
  content: React.ReactNode
}

export function QuestionAccordion({ title, content }: QuestionAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAccordionChange = (value: string) => {
    setIsOpen(value === 'item-1')
  }

  return (
    <Accordion.Root
      collapsible
      defaultValue="1"
      type="single"
      className="py-xm border-b border-solid border-grey-300"
      onValueChange={handleAccordionChange}
    >
      <Accordion.Item value="item-1">
        <Accordion.Trigger className="flex w-full items-center justify-between text-grey-300 text-body-mid font-bold text-start md:text-BODY-XM sm:text-BODY-XM gap-60 sm:gap-xm">
          {title}
          <Image
            src="/images/icons/icon-arrow-right.svg"
            alt="Toggle Accordion"
            width={15}
            height={26}
            className={`${isOpen ? 'rotate-90' : 'rotate-0'}`}
          />
        </Accordion.Trigger>
        <Accordion.Content className="text-grey-300 font-normal text-BODY-XM md:text-BODY-XM sm:text-BODY-XM">
          <div className="pt-xm">{content}</div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  )
}
