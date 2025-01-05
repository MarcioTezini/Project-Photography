import React, { forwardRef } from 'react'
import DatePicker, { DatePickerProps } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './custom-datepicker.css'
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface ValidationMessage {
  message: string
  isValid?: boolean
}
interface DatePickerInputProps {
  value?: string
  onClick?: () => void
  inputPlaceholder: string | undefined
  variant?: 'error' | 'alert' | 'success' | 'info'
  disabled?: boolean
  validationMessages?: ValidationMessage[]
  inputClassName?: string
}

const DatePickerInput = forwardRef<HTMLButtonElement, DatePickerInputProps>(
  (
    {
      value,
      onClick,
      inputPlaceholder,
      variant,
      disabled,
      inputClassName,
      validationMessages,
    },
    ref,
  ) => {
    const variantClasses = {
      error: 'border-notify-warning-normal text-notify-warning-darkest',
      alert: 'border-notify-alert-normal text-notify-alert-darkest',
      success: 'border-notify-success-normal text-notify-success-darkest',
      info: 'border-notify-info-normal text-notify-info-darkest',
    }

    const defaultBorderClass = disabled ? 'border-grey-400' : 'border-grey-500'
    const variantClass =
      variant && !disabled ? variantClasses[variant] : defaultBorderClass

    return (
      <div className="w-full relative">
        <button
          className={`bg-grey-300 disabled:bg-grey-400 h-[42px] flex items-center justify-between px-xs rounded-xs border border-solid ${variantClass} outline-none ${inputClassName} ${
            value !== undefined && value !== ''
              ? 'pt-s px-xs pb-xxxs text-grey-800 disabled:text-grey-500 text-BODY-M font-Medium'
              : 'p-xs text-grey-700 disabled:text-grey-500 text-BODY-XM font-Regular'
          }`}
          onClick={(e) => {
            e.preventDefault()
            onClick?.()
          }}
          ref={ref}
          disabled={disabled}
        >
          <span className="text-BODY-XM">{value || inputPlaceholder}</span>
        </button>
        {value !== undefined && value !== '' && (
          <label className="absolute left-xs top-xs text-LABEL-M font-Semibold text-grey-600">
            {inputPlaceholder}
          </label>
        )}
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

DatePickerInput.displayName = 'DatePickerInput'

type CustomDatePickerProps = DatePickerProps & {
  variant?: 'error' | 'alert' | 'success' | 'info'
  inputPlaceholder?: string
  inputClassName?: string
  containerClassName?: string
  width?: number
  maxWidth?: boolean
  showTimeInput?: boolean // New prop to control time input
}

export default function CustomDatePicker({
  variant,
  inputPlaceholder,
  inputClassName,
  containerClassName,
  showTimeInput = false, // Default to false if not provided
  ...props
}: CustomDatePickerProps) {
  const t = useTranslations('Components.DatePicker')
  const weekDayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  }

  return (
    <DatePicker
      {...props}
      timeInputLabel={showTimeInput ? 'Time:' : undefined}
      dateFormat={showTimeInput ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
      showTimeInput={showTimeInput}
      popperPlacement="bottom-start"
      enableTabLoop={false}
      wrapperClassName={containerClassName}
      renderCustomHeader={({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="flex flex-col justify-between items-start bg-grey-400">
          <div className="flex justify-between items-center self-stretch">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              type="button"
            >
              <FiChevronLeft className="h-[20px] w-[20px]" />
            </button>
            <span className="text-grey-900 text-BODY-XM font-Semibold">
              {t(`months.${date.getMonth()}`)} {date.getFullYear()}
            </span>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              type="button"
            >
              <FiChevronRight className="h-[20px] w-[20px]" />
            </button>
          </div>
        </div>
      )}
      customInput={
        <DatePickerInput
          value={props.value as string}
          onClick={props.onInputClick}
          variant={variant}
          disabled={props.disabled}
          inputClassName={inputClassName}
          inputPlaceholder={inputPlaceholder}
        />
      }
      calendarClassName="custom-calendar"
      formatWeekDay={(day) => t(`days.${weekDayMap[day]}`)}
      renderDayContents={(day) => <span>{day}</span>}
    />
  )
}
