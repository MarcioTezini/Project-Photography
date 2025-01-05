import React, { useState, useEffect } from 'react'
import * as RadioGroup from '@radix-ui/react-radio-group'

interface GroupRadioProps {
  numberOfRadios?: number
  disabled?: boolean
  labels?: string[]
  value?: string
  selected?: string | undefined
  onChange?: (value: string) => void
}

const GroupRadio: React.FC<GroupRadioProps> = ({
  numberOfRadios = 1,
  disabled = false,
  labels = [''],
  selected = undefined,
  onChange,
}) => {
  const [value, setValue] = useState<string | undefined>(selected)

  useEffect(() => {
    setValue(selected)
  }, [selected])

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  const renderRadioButtons = () => {
    const radios = []
    for (let i = 0; i < numberOfRadios; i++) {
      const radioValue = labels[i]
      const isSelected = value === radioValue

      radios.push(
        <div className="flex items-center gap-xs mb-xm" key={`radio-${i}`}>
          <RadioGroup.Item
            className={`w-s h-s border rounded-xxl flex items-center justify-center focus:outline-none ${
              disabled
                ? `bg-grey-400 ${
                    isSelected ? 'border-grey-500' : 'border-grey-400'
                  }`
                : `bg-white ${
                    isSelected
                      ? 'border-fichasPay-main-400 hover:bg-fichasPay-main-100 hover:border-fichasPay-main-500'
                      : 'border-grey-500'
                  }`
            }`}
            value={radioValue}
            id={`r${i + 2}`}
            disabled={disabled}
          >
            <RadioGroup.Indicator
              className={`w-xs h-xs rounded-xxl ${
                disabled
                  ? isSelected
                    ? 'bg-fichasPay-main-400'
                    : 'bg-grey-400'
                  : isSelected
                    ? 'bg-fichasPay-main-400 hover:bg-fichasPay-main-500'
                    : 'bg-fichasPay-main-400'
              }`}
            />
          </RadioGroup.Item>
          <label
            className="text-BODY-XM font-Regular text-grey-900"
            htmlFor={`r${i + 2}`}
          >
            {labels[i] || `Option ${i + 1}`}
          </label>
        </div>,
      )
    }
    return radios
  }

  return (
    <form>
      <RadioGroup.Root
        className="space-y-4 flex gap-xxxm"
        value={value}
        onValueChange={handleValueChange}
        aria-label="View density"
        disabled={disabled}
      >
        {renderRadioButtons()}
      </RadioGroup.Root>
    </form>
  )
}

export default GroupRadio
