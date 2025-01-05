import React, { forwardRef } from 'react'
import { FiMinus, FiPlus } from 'react-icons/fi'

interface CounterProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number
  max?: number
  step?: number
}

const Counter = forwardRef<HTMLInputElement, CounterProps>(
  (
    { value = 1, onChange, min = 0, max = 100, step = 1, ...inputProps },
    ref,
  ) => {
    const updateValue = (newValue: number) => {
      const clampedValue = newValue
        ? Math.max(min, Math.min(max, newValue))
        : ''
      const event = {
        target: { value: clampedValue.toString() },
      } as React.ChangeEvent<HTMLInputElement>
      onChange?.(event)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = Number(event.target.value) || 0
      updateValue(inputValue)
    }

    const increment = () => updateValue(Number(value) + step)
    const decrement = () => updateValue(Number(value) - step)

    const isDecrementDisabled = Number(value) <= min
    const isIncrementDisabled = Number(value) >= max

    return (
      <div className="flex gap-xs">
        <button
          type="button"
          onClick={decrement}
          disabled={isDecrementDisabled}
          className={`${isDecrementDisabled ? 'text-grey-500 cursor-not-allowed' : 'text-fichasPay-main-400 cursor-pointer'}`}
        >
          <FiMinus />
        </button>
        <input
          {...inputProps}
          ref={ref}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className="w-[35px] h-[25px] leading-4 text-center p-xxs rounded-xs bg-grey-300 border border-grey-500 border-solid text-grey-600 text-BODY-S appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={increment}
          disabled={isIncrementDisabled}
          className={`${isIncrementDisabled ? 'text-grey-500 cursor-not-allowed' : 'text-fichasPay-main-400 cursor-pointer'}`}
        >
          <FiPlus />
        </button>
      </div>
    )
  },
)

Counter.displayName = 'Counter'

export default Counter
