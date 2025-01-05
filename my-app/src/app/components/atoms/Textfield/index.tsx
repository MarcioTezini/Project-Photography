import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

interface ValidationMessage {
  message: string
  isValid?: boolean
}

interface TextfieldProps extends React.ComponentProps<'input'> {
  name: string
  prefixText?: string
  hasError?: boolean
  validationMessages?: ValidationMessage[]
  textOrientation?: boolean
  icon?: React.ReactNode
  variant?: 'error' | 'alert' | 'success' | 'info'
  maxLength?: number
  numericOnly?: boolean
  tooltip?: React.ReactNode
  inputClassname?: string // Propriedade opcional para classes adicionais
  isDarkMode?: boolean
}

const Textfield = forwardRef<HTMLInputElement, TextfieldProps>(
  (
    {
      placeholder,
      type,
      inputMode,
      required = false,
      disabled = false,
      validationMessages,
      textOrientation = false,
      icon,
      prefixText = '',
      value = '',
      variant,
      maxLength,
      numericOnly = false,
      tooltip,
      inputClassname = '', // Default para string vazia
      isDarkMode = false,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [prefixWidth, setPrefixWidth] = useState(0)
    const prefixRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
      const handleAutoComplete = () => {
        if (prefixRef.current) {
          setPrefixWidth(prefixRef.current.offsetWidth)
        }
      }

      if (ref && 'current' in ref && ref.current) {
        ref.current.addEventListener('focus', handleAutoComplete)
      }

      return () => {
        if (ref && 'current' in ref && ref.current) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          ref.current.removeEventListener('focus', handleAutoComplete)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefixText, isDarkMode])

    useEffect(() => {
      if (prefixRef.current) {
        setPrefixWidth(prefixRef.current.offsetWidth)
      }
    }, [value, isDarkMode])

    const toggleShowPassword = () => {
      setShowPassword((prevState) => !prevState)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = event.target.value

      if (numericOnly) {
        newValue = newValue.replace(/[^0-9]/g, '')
      }

      if (type !== 'number' && maxLength !== undefined) {
        newValue = newValue.slice(0, maxLength)
      }

      if (props.onChange) {
        props.onChange({
          ...event,
          target: {
            ...event.target,
            value: newValue,
          },
        })
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (numericOnly) {
        const key = event.key

        // Permitir Ctrl + C, Ctrl + V e Ctrl + A
        if (event.ctrlKey && (key === 'c' || key === 'v' || key === 'a')) {
          return
        }

        if (
          !/^[0-9]$/.test(key) &&
          !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
            key,
          )
        ) {
          event.preventDefault()
        }
      }
    }

    const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
      if (numericOnly) {
        const input = event.currentTarget as HTMLInputElement
        input.value = input.value.replace(/[^0-9]/g, '')
      }
    }

    const isPasswordField = type === 'password'
    const inputType = isPasswordField && showPassword ? 'text' : type

    const variantClasses = {
      error: `border-notify-warning-normal`,
      alert: 'border-notify-alert-normal',
      success: 'border-notify-success-normal',
      info: 'border-notify-info-normal',
    }

    const defaultBorderClass = disabled
      ? `border-grey-${isDarkMode ? '700' : '400'}`
      : `${isDarkMode ? 'border-grey-700' : 'border-grey-500'}`
    const variantClass = variant && !disabled ? variantClasses[variant] : ''
    const t = useTranslations()
    return (
      <div className="w-full relative">
        <div className="relative flex items-center">
          {prefixText && (
            <span
              ref={prefixRef}
              className={`absolute pt-[6px] left-xs ${isDarkMode ? 'text-grey-300' : 'text-grey-800'} text-BODY-XM font-Regular`}
            >
              {prefixText}
            </span>
          )}
          <input
            ref={ref}
            placeholder={!prefixText ? placeholder : undefined}
            className={`${isDarkMode ? 'bg-grey-800' : 'bg-grey-300'} disabled:bg-grey-${isDarkMode ? '600' : '400'} w-full h-[52px] ${
              value !== undefined && value !== ''
                ? 'pt-xs px-xs pb-xxxs'
                : 'p-xs'
            } justify-center items-center rounded-xs border border-solid ${
              variant ? variantClass : defaultBorderClass
            } outline-none ${isDarkMode ? 'text-grey-300' : 'text-grey-800'} disabled:text-grey-500 text-BODY-XM font-Regular ${
              type === 'number' ? 'no-spinner' : ''
            } ${isPasswordField || icon ? 'pr-[60px]' : ''} ${inputClassname}`}
            style={{
              paddingLeft: prefixText ? `${prefixWidth + 10}px` : undefined, // Aplica padding com base no prefixo
            }}
            type={inputType}
            required={required}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            value={value}
            maxLength={type !== 'number' ? maxLength : undefined}
            inputMode={inputMode || (type === 'number' ? 'numeric' : undefined)}
            {...props}
          />
          {((value !== undefined && value !== '') || prefixText) && (
            <label
              className={`absolute left-xs top-xs text-LABEL-M font-Semibold ${disabled ? 'text-grey-500' : 'text-grey-600'}`}
            >
              {placeholder}
            </label>
          )}
          {isPasswordField && (
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-[12px] flex items-center px-xs bg-transparent border-none cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-grey-600 w-m h-m" />
              ) : (
                <AiOutlineEye className="text-grey-600 w-m h-m" />
              )}
            </button>
          )}
          {icon && !isPasswordField && (
            <div className="absolute right-xs w-m h-m">{icon}</div>
          )}
          {tooltip && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center px-xs">
              {tooltip}
            </div>
          )}
        </div>
        {validationMessages && validationMessages.length > 0 && (
          <div className="flex flex-col gap-xxs pt-xxs pl-xs">
            {textOrientation === true && (
              <p className=" text-LABEL-L font-Semibold text-grey-300">
                {t('Panel.Password.passwordForm.passwordMustContain')}
              </p>
            )}
            {validationMessages.map((valMsg) => (
              <p
                key={valMsg.message}
                className={`flex gap-xxs items-center text-LABEL-L font-Medium text-notify-warning-${isDarkMode ? 'normal' : 'darkest'}`}
              >
                {valMsg.isValid ? (
                  <FiCheckCircle className="w-[12px] h-[12px] text-notify-success-darkest" />
                ) : (
                  <FiAlertCircle
                    className={`w-[12px] h-[12px] text-notify-warning-${isDarkMode ? 'normal' : 'darkest'}`}
                  />
                )}
                {valMsg.message}
              </p>
            ))}
          </div>
        )}
        <style jsx>{`
          input[type='number']::-webkit-outer-spin-button,
          input[type='number']::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type='number'] {
            -moz-appearance: textfield;
          }
        `}</style>
      </div>
    )
  },
)

Textfield.displayName = 'Textfield'

export default Textfield
