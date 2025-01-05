import React, { useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface InfoBoxProps {
  title: string
  description: React.ReactNode
  hasAccordion?: boolean
}

const InfoBox: React.FC<InfoBoxProps> = ({
  title,
  description,
  hasAccordion = false,
}) => {
  const [isOpen, setIsOpen] = useState(!hasAccordion) // Por padrão, aberto se `hasAccordion` for falso

  const toggleAccordion = () => {
    if (hasAccordion) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div>
      <div
        className={`flex items-center justify-between bg-a-black-50 ${hasAccordion && !isOpen ? 'rounded-sm' : 'rounded-t-sm'} py-s px-xs`}
      >
        <h2 className="text-BODY-XM text-grey-300 font-Bold">{title}</h2>
        {hasAccordion && (
          <div className="ml-auto">
            {isOpen ? (
              <FiChevronUp
                size={24}
                className="text-grey-300 hover:cursor-pointer"
                onClick={toggleAccordion}
              />
            ) : (
              <FiChevronDown
                size={24}
                className="text-grey-300 hover:cursor-pointer"
                onClick={toggleAccordion}
              />
            )}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="bg-a-black-30 rounded-b-sm bg-opacity-30 py-s px-xs">
          <p className="text-BODY-XM text-grey-300">{description}</p>
        </div>
      )}
    </div>
  )
}

export default InfoBox
