'use client'

import React, { forwardRef } from 'react'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

interface ValidationMessage {
  message: string
  isValid?: boolean
}

interface TextAreaProps extends React.ComponentProps<'textarea'> {
  name: string
  hasError?: boolean
  validationMessages?: ValidationMessage[]
  icon?: React.ReactNode
  variant?: 'error' | 'alert' | 'success' | 'info'
  maxLength?: number
  numericOnly?: boolean
  height?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      placeholder,
      required = false,
      disabled = false,
      validationMessages,
      icon,
      value = '',
      variant,
      maxLength,
      height = '100px',
      ...props
    },
    ref,
  ) => {
    const variantClasses = {
      error: `border-notify-warning-normal text-notify-warning-darkest`,
      alert: 'border-notify-alert-normal text-notify-alert-darkest',
      success: 'border-notify-success-normal text-notify-success-darkest',
      info: 'border-notify-info-normal text-notify-info-darkest',
    }

    const defaultBorderClass = disabled ? 'border-grey-400' : 'border-grey-500'
    const variantClass = variant && !disabled ? variantClasses[variant] : ''

    return (
      <div className="w-full relative">
        <div className="relative flex items-center">
          <textarea
            ref={ref}
            placeholder={placeholder}
            className={`placeholder:text-grey-700 bg-grey-300 disabled:bg-grey-400 w-full ${
              value !== undefined && value !== ''
                ? 'pt-m px-xs pb-xxxs'
                : 'p-xs'
            } justify-center items-center rounded-xs border border-solid ${
              variant ? variantClass : defaultBorderClass
            } outline-none text-grey-800 disabled:text-grey-500 text-BODY-XM font-Regular`}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            style={{ height }}
            {...props}
          />
          {value !== undefined && value !== '' && (
            <label className="absolute left-xs top-xs text-LABEL-M font-Semibold text-grey-600">
              {placeholder}
            </label>
          )}
          {icon && <div className="absolute right-xs w-m h-m">{icon}</div>}
        </div>
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
  },
)

TextArea.displayName = 'TextArea'

export default TextArea
