import React from 'react'
import { FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi'

interface StepperProps {
  step: number
  numberOfSteps: number
  variant?: 'success' | 'error' | 'alert'
}

export default function Stepper({
  step,
  numberOfSteps,
  variant,
}: StepperProps) {
  const getBorderColor = (index: number) => {
    if (variant === 'success' && index + 1 < step) {
      return 'border-notify-success-normal'
    } else if (variant === 'error' && index + 1 < step) {
      return 'border-grey-300 opacity-50'
    } else if (variant === 'alert' && index + 1 < step) {
      return 'border-grey-300 opacity-50'
    } else if (variant === 'error' && index + 1 === step) {
      return 'border-notify-warning-normal'
    } else if (variant === 'alert' && index + 1 === step) {
      return 'border-notify-alert-normal'
    } else {
      return index + 1 <= step
        ? 'border-grey-300'
        : 'border-grey-300 opacity-50'
    }
  }

  const getIcon = (index: number) => {
    if (variant === 'success' && index + 1 < step) {
      return <FiCheck className="text-notify-success-normal" />
    } else if (variant === 'error' && index + 1 < step) {
      return <FiCheck className="text-grey-300 opacity-50" />
    } else if (variant === 'alert' && index + 1 < step) {
      return <FiCheck className="text-grey-300 opacity-50" />
    } else if (variant === 'error' && index + 1 === step) {
      return <FiX className="text-notify-warning-normal" />
    } else if (variant === 'alert' && index + 1 === step) {
      return <FiAlertTriangle className="text-notify-alert-normal" />
    } else {
      return (
        <span className="text-grey-300 text-BODY-M font-Extrabold">
          {index + 1}
        </span>
      )
    }
  }

  const getSize = (index: number) => {
    if (index + 1 === step && variant !== 'error' && variant !== 'alert') {
      return 'w-[45px] h-[55px]'
    } else {
      return 'w-[40px] h-[49px]'
    }
  }

  return (
    <div className="flex justify-center items-center mt-xxxm h-[55px]">
      {Array.from({ length: numberOfSteps }, (_, index) => (
        <React.Fragment key={index}>
          <div
            className={`flex p-[12px] flex-col justify-center items-center gap-[12px] border-[3px] border-solid rounded-xxl ${getSize(index)} ${getBorderColor(index)}`}
          >
            {getIcon(index)}
          </div>
          {index < numberOfSteps - 1 && (
            <div className="w-[24px] border-t-2 border-dotted border-grey-300" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
