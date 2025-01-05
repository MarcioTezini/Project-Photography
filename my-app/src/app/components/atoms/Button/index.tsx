import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useMediaQuery } from 'react-responsive'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?:
    | 'primary'
    | 'outline'
    | 'text'
    | 'warning'
    | 'info'
    | 'success'
    | 'alert'
  icon?: React.ReactNode
  preIcon?: React.ReactNode
  addIcon?: React.ReactNode
  disabled?: boolean
  width?: number
  maxWidth?: boolean
  children?: React.ReactNode
  hasShadow?: boolean
  preDisabled?: boolean
  showIconOnly?: boolean
  inputClassName?: string
  noBorder?: boolean
  noShadow?: boolean
  isBrandButton?: boolean // Nova propriedade para trabalhar com cores fichasPay
}

const baseClasses =
  'flex justify-center items-center font-Semibold rounded-xs border border-solid border-[transparent]'

const shadowClass = 'shadow-DShadow-Default'

const sizeClasses = {
  sm: 'px-xs py-xxs text-BODY-S',
  md: 'gap-xs py-xs px-s text-BODY-S',
  lg: 'gap-xs p-s text-BODY-M',
}

// Variantes sem isBrandButton (mantendo as cores padrões)
const variantClasses = {
  primary:
    'bg-fichasPay-main-400 text-grey-900 hover:bg-fichasPay-main-300 active:bg-fichasPay-main-500',
  outline:
    'text-grey-900 border border-solid border-fichasPay-secondary-400 hover:bg-grey-400 active:bg-fichasPay-main-500 active:border-fichasPay-main-500 hover:border-grey-500',
  text: 'text-grey-900 hover:bg-grey-400 active:bg-fichasPay-main-500 hover:border hover:border-solid hover:border-grey-500 active:border-fichasPay-main-500 shadow-none',
  warning:
    'bg-notify-warning-normal text-grey-300 hover:bg-notify-warning-light active:bg-notify-warning-dark',
  info: 'bg-notify-info-normal text-grey-900 hover:bg-notify-info-light active:bg-notify-info-dark',
  success:
    'bg-notify-success-normal text-grey-300 hover:bg-notify-success-light active:bg-notify-success-dark',
  alert:
    'bg-notify-alert-normal text-grey-900 hover:bg-notify-alert-light active:bg-notify-alert-dark',
}

// Variantes com isBrandButton (apenas ajustando fundo/borda para fichasPay)
const brandVariantClasses = {
  primary:
    'bg-fichasPay-main-400 text-grey-900 hover:bg-fichasPay-main-300 active:bg-fichasPay-main-500',
  outline:
    'text-grey-300 border border-solid border-grey-300 hover:bg-grey-400 hover:text-grey-900 active:bg-fichasPay-main-500 active:border-fichasPay-main-500 hover:border-grey-500',
  text: 'text-grey-300 hover:bg-fichasPay-secondary-300 active:bg-fichasPay-main-500 hover:border-fichasPay-secondary-400 shadow-none',
  warning:
    'bg-notify-warning-normal text-grey-300 hover:bg-notify-warning-light active:bg-notify-warning-dark',
  info: 'bg-notify-info-normal text-grey-900 hover:bg-notify-info-light active:bg-notify-info-dark',
  success:
    'bg-notify-success-normal text-grey-300 hover:bg-notify-success-light active:bg-notify-success-dark',
  alert:
    'bg-notify-alert-normal text-grey-900 hover:bg-notify-alert-light active:bg-notify-alert-dark',
}

const disabledVariantClasses = {
  primary: 'bg-grey-400 text-grey-600',
  outline: 'text-grey-600 border border-solid border-grey-500',
  text: 'text-grey-600',
  warning: 'bg-grey-400 text-grey-600',
  info: 'bg-grey-400 text-grey-600',
  success: 'bg-grey-400 text-grey-600',
  alert: 'bg-grey-400 text-grey-600',
}

const brandDisabledVariantClasses = {
  primary: 'bg-grey-400 text-grey-600',
  outline: 'text-grey-600 border border-solid border-grey-500',
  text: 'text-grey-600 shadow-none',
  warning: 'bg-grey-400 text-grey-600',
  info: 'bg-grey-400 text-grey-600',
  success: 'bg-grey-400 text-grey-600',
  alert: 'bg-grey-400 text-grey-600',
}

const preDisableVariantClasses = {
  primary: 'bg-fichasPay-a-main-50 text-grey-700',
  outline: 'text-grey-700 border border-solid border-grey-400',
  text: 'text-grey-700',
  warning: 'bg-grey-300 text-grey-700',
  info: 'bg-grey-300 text-grey-700',
  success: 'bg-grey-300 text-grey-700',
  alert: 'bg-grey-300 text-grey-700',
}

const brandPreDisableVariantClasses = {
  primary: 'bg-fichasPay-a-main-50 text-grey-700',
  outline: 'text-grey-700 border border-solid border-grey-400',
  text: 'text-grey-500 bg-fichasPay-a-main-50',
  warning: 'bg-grey-300 text-grey-700',
  info: 'bg-grey-300 text-grey-700',
  success: 'bg-grey-300 text-grey-700',
  alert: 'bg-grey-300 text-grey-700',
}

export function Button({
  size = 'md',
  variant = 'primary',
  icon,
  preIcon,
  addIcon,
  disabled = false,
  width,
  maxWidth = false,
  children,
  hasShadow = true,
  preDisabled = false,
  showIconOnly = false,
  inputClassName,
  noBorder = false,
  noShadow = false,
  isBrandButton = false,
  className, // Adicionando className como prop
  ...props
}: ButtonProps) {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 679px)' })

  const [shouldShowIconOnly, setShouldShowIconOnly] = useState(false)

  useEffect(() => {
    setShouldShowIconOnly(showIconOnly && isSmallScreen)
  }, [isSmallScreen, showIconOnly])

  const variantStyles = isBrandButton
    ? brandVariantClasses[variant]
    : variantClasses[variant]

  const disabledStyles = isBrandButton
    ? brandDisabledVariantClasses[variant]
    : disabledVariantClasses[variant]

  const preDisableStyles = isBrandButton
    ? brandPreDisableVariantClasses[variant]
    : preDisableVariantClasses[variant]

  const buttonClasses = classNames(
    baseClasses,
    {
      [sizeClasses[size]]: !shouldShowIconOnly,
      [disabledStyles]: disabled,
      [preDisableStyles]: preDisabled,
      'px-s py-xxs': shouldShowIconOnly,
    },
    !disabled && !preDisabled && variantStyles,
    { 'w-full': maxWidth && !shouldShowIconOnly },
    { 'border-0': noBorder },
    { [shadowClass]: hasShadow && !noShadow },
    inputClassName,
    className, // Adiciona className ao final
  )

  const buttonWidth: React.CSSProperties = {
    minWidth:
      !shouldShowIconOnly && width && !maxWidth ? `${width}px` : undefined,
  }

  return (
    <button
      {...props}
      disabled={disabled || preDisabled}
      style={buttonWidth}
      className={buttonClasses}
    >
      {preIcon && <span>{preIcon}</span>}
      {!(shouldShowIconOnly || icon) && (
        <span
          className={`flex-grow text-center ${preIcon && !addIcon && '-pl-m'} ${
            !preIcon && addIcon && '-pr-m'
          }`}
        >
          {children}
        </span>
      )}
      {icon}
      {addIcon && <span>{addIcon}</span>}
    </button>
  )
}

export default Button
