import React, { useState, useEffect } from 'react'
import { FiAlertCircle, FiCheckCircle, FiMinus, FiPlus } from 'react-icons/fi'
import { UseFormRegisterReturn } from 'react-hook-form'

interface ValidationMessage {
  message: string
  isValid?: boolean
}

interface CounterProps {
  min?: number
  max?: number
  value?: string | number
  validationMessages?: ValidationMessage[]
  onChange: (value: string) => void
  register?: UseFormRegisterReturn
}

const Counter: React.FC<CounterProps> = ({
  min = 0,
  max = 999,
  value,
  validationMessages,
  register,
}) => {
  const initialNumber =
    typeof value === 'string' ? parseInt(value, 10) : (value ?? min)
  const [number, setNumber] = useState(initialNumber)

  useEffect(() => {
    const parsedValue = typeof value === 'string' ? parseInt(value, 10) : value
    if (parsedValue !== undefined && !isNaN(parsedValue)) {
      setNumber(parsedValue)
    }
  }, [value])

  const increment = () => {
    if (number < max) setNumber(number + 1)
  }

  const decrement = () => {
    if (number > min) setNumber(number - 1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.floor(Number(e.target.value))
    if (value >= min && value <= max) {
      setNumber(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.' || e.key === ',') {
      e.preventDefault()
    }
  }

  return (
    <div className="flex gap-xs">
      <button
        onClick={decrement}
        disabled={number <= min}
        className={`${number <= min ? 'text-grey-500 cursor-not-allowed' : 'text-fichasPay-main-400 cursor-pointer'}`}
      >
        <FiMinus />
      </button>
      <input
        type="number"
        value={number}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        step="1"
        className="w-[35px] h-[25px] leading-4 text-center p-xxs rounded-xs bg-grey-300 border border-grey-500 border-solid text-grey-600 text-BODY-S appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        {...register} // Spread the register prop here
      />
      <button
        onClick={increment}
        disabled={number >= max}
        className={`${number >= max ? 'text-grey-500 cursor-not-allowed' : 'text-fichasPay-main-400 cursor-pointer'}`}
      >
        <FiPlus />
      </button>
      {validationMessages && validationMessages.length > 0 && (
        <div className="flex flex-col gap-xxs pt-xxs ml-xs self-stretch">
          {validationMessages.map((valMsg) => (
            <p
              key={valMsg.message}
              className="flex gap-xxs items-center text-LABEL-L font-Medium text-grey-800"
            >
              {valMsg.isValid ? (
                <FiCheckCircle className="w-[12px] h-[12px] text-notify-success-darkest" />
              ) : (
                <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
              )}
              {valMsg.message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default Counter
