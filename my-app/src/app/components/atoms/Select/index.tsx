import React, { useRef, useState, useEffect } from 'react'
import * as Select from '@radix-ui/react-select'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import './styles.css'
import { tv } from 'tailwind-variants'
import { FiAlertCircle } from 'react-icons/fi'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'

interface Option {
  value: string
  label: string | React.ReactNode
}

interface ValidationMessage {
  message: string
  isValid?: boolean
}

type VariantType = 'default' | 'info' | 'success' | 'warning' | 'alert'

interface SelectorProps {
  width?: number
  maxWidth?: boolean
  validationMessages?: ValidationMessage[]
  variant?: VariantType
  iconColorVariant?: VariantType
  placeholderColorVariant?: VariantType
  disabled?: boolean
  placeholder: string
  value: string
  isDarkMode?: boolean
  isDarkModeCard?: boolean
  onChange: (value: string) => void
  onClick?: () => void
  options: Option[]
  icon?: React.ReactNode
  iconSize?: number
  optionsDisabled?: (value: string) => boolean
  separatorInPosition?: number
  messageSeparator?: string
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof Select.Content>,
  React.ComponentPropsWithoutRef<typeof Select.Content>
>(({ children, ...props }, forwardedRef) => {
  return (
    <Select.Portal>
      <Select.Content
        {...props}
        ref={(instance) => {
          if (typeof forwardedRef === 'function') {
            forwardedRef(instance)
          } else if (forwardedRef) {
            forwardedRef.current = instance
          }
          if (!instance) return

          // Prevent default touchstart behavior
          instance.ontouchstart = (e) => {
            e.preventDefault()
          }
        }}
      >
        {children}
      </Select.Content>
    </Select.Portal>
  )
})

SelectContent.displayName = 'SelectContent'

export default function Selector({
  width,
  maxWidth = false,
  validationMessages,
  variant = 'default',
  iconColorVariant = 'default',
  placeholderColorVariant = 'default',
  disabled = false,
  placeholder,
  value,
  isDarkMode = false,
  isDarkModeCard = false,
  onChange,
  onClick,
  options,
  icon,
  iconSize = 20,
  optionsDisabled = () => false,
  separatorInPosition,
  messageSeparator = '',
}: SelectorProps) {
  const [open, setOpen] = useState(false)
  const [isScrollbarActive, setIsScrollbarActive] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { hasUnsavedChanges } = useSaveChangesDialogStore()

  useEffect(() => {
    if (triggerRef.current && contentRef.current) {
      contentRef.current.style.width = `calc(${triggerRef.current.clientWidth}px + 2%)`
    }
  }, [open])

  const selectorWidth: React.CSSProperties = {
    width: width && !maxWidth ? `${width}px` : '100%',
  }

  const selector = tv({
    base: `flex relative w-full h-full py-[12px] pl-xs pr-[12px] items-center gap-[5px] bg-grey-${isDarkMode ? '800' : '300'} text-grey-${isDarkMode ? '300' : '900'} text-BODY-XM font-Medium outline-none justify-between hover:border-2`,
    variants: {
      border: {
        default: `border-grey-${isDarkMode ? '700' : '500'}`,
        info: 'border-notify-info-normal',
        success: 'border-notify-success-normal',
        warning: 'border-notify-warning-normal',
        alert: 'border-notify-alert-normal',
      },
      disabled: {
        true: 'border-grey-500 hover:border cursor-not-allowed',
      },
      dropdownOpen: {
        true: 'border-t-2 border-x-2 border-solid rounded-t-xs',
        false: 'border border-solid rounded-xs',
      },
    },
  })

  const selectorViewport = tv({
    base: `border-t border-b-2 ${isScrollbarActive ? 'border-l-2' : 'border-x-2 rounded-b-xs'} overflow-y-auto`,
    variants: {
      border: {
        default: `border-grey-${isDarkMode ? '700' : '500'} border-t-grey-${isDarkMode ? '700' : '500'}`,
        info: 'border-notify-info-normal border-t-grey-500',
        success: 'border-notify-success-normal border-t-grey-500',
        warning: 'border-notify-warning-normal border-t-grey-500',
        alert: 'border-notify-alert-normal border-t-grey-500',
      },
    },
  })

  const selectorItem = tv({
    base: `flex self-stretch ${isDarkModeCard ? 'py-[2px]' : 'py-[12px]'} ${isDarkModeCard ? 'px-[2px]' : 'px-xs'} outline-none text-BODY-XM font-Regular text-grey-${isDarkMode ? '300' : '700'} hover:bg-fichasPay-a-secondary-5 border-[transparent]`,
    variants: {
      border: {
        default: `hover:border-l-4 hover:border-grey-${isDarkMode ? '600' : '500'}`,
        info: 'hover:border-l-4 hover:border-notify-info-normal',
        success: 'hover:border-l-4 hover:border-notify-success-normal',
        warning: 'hover:border-l-4 hover:border-notify-warning-normal',
        alert: 'hover:border-l-4 hover:border-notify-alert-normal',
      },
      disabled: {
        true: 'cursor-not-allowed text-grey-500',
      },
    },
  })

  const selectorIconColor = tv({
    variants: {
      color: {
        default: 'text-grey-500',
        info: 'text-notify-info-normal',
        success: 'text-notify-success-normal',
        warning: 'text-notify-warning-normal',
        alert: 'text-notify-alert-normal',
      },
      disabled: {
        true: 'text-grey-500',
      },
    },
  })

  const placeholderColor = tv({
    variants: {
      color: {
        default: `text-grey-${isDarkMode ? '600' : '700'}`,
        info: 'text-notify-info-normal',
        success: 'text-notify-success-normal',
        warning: 'text-notify-warning-normal',
        alert: 'text-notify-alert-normal',
      },
      disabled: {
        true: 'text-grey-500',
      },
    },
  })

  const renderSeparator = (index: number, message: string) => {
    if (separatorInPosition !== index) return null
    return (
      <div className="mt-xs">
        <span className="pl-xs text-LABEL-L font-Semibold text-grey-600">
          {message}
        </span>
        <Select.Separator className="m-[5px] h-[1px] bg-grey-500" />
      </div>
    )
  }

  useEffect(() => {
    const checkScrollbar = () => {
      if (contentRef.current) {
        const hasScrollbar =
          contentRef.current.scrollHeight > contentRef.current.clientHeight
        setIsScrollbarActive(hasScrollbar)
      }
    }

    const observer = new ResizeObserver(checkScrollbar)
    if (contentRef.current) {
      observer.observe(contentRef.current)
    }

    return () => {
      if (contentRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(contentRef.current)
      }
    }
  }, [open])

  return (
    <Select.Root
      onValueChange={onChange}
      value={value}
      open={open}
      onOpenChange={(isOpen) => {
        if (onClick && hasUnsavedChanges) {
          onClick() // Executa onClick se passado por prop e hasUnsavedChanges for true
        } else {
          setOpen(isOpen) // Caso contrário, executa setOpen
        }
      }}
      disabled={disabled}
    >
      <Select.Trigger
        ref={triggerRef}
        style={{ ...selectorWidth, height: '54px' }}
        className={`select-trigger ${selector({ border: variant, disabled, dropdownOpen: open })}`}
        disabled={disabled}
      >
        <div className="flex items-center gap-xs">
          {icon && (
            <div className="flex items-center justify-center">
              {React.cloneElement(icon as React.ReactElement, {
                className: selectorIconColor({
                  color: iconColorVariant,
                  disabled,
                }),
                size: iconSize,
              })}
            </div>
          )}
          <div
            className={`flex flex-col items-start text-BODY-XM font-Regular mt-1 ${
              disabled
                ? 'text-grey-500'
                : value !== undefined && value !== ''
                  ? `text-grey-${isDarkMode ? '300' : '900'}`
                  : placeholderColor({
                      color: placeholderColorVariant,
                      disabled,
                    })
            }`}
          >
            {value !== undefined && value !== '' && (
              <label
                className={`text-LABEL-M font-Semibold ${
                  disabled ? 'text-grey-500' : 'text-grey-600'
                }`}
              >
                {placeholder}
              </label>
            )}
            <Select.Value placeholder={placeholder} />
          </div>
        </div>
        <Select.Icon>
          <ChevronDownIcon
            height={14}
            width={14}
            className={`${disabled ? 'text-grey-500' : 'text-grey-700'}`}
          />
        </Select.Icon>
      </Select.Trigger>
      <SelectContent
        ref={contentRef}
        position="popper"
        className={`SelectContent bg-grey-${isDarkMode ? '700' : '300'}  shadow-DShadow-Default z-20`}
      >
        <ScrollArea
          style={{
            maxHeight: 'var(--radix-select-content-available-height)',
            width: '100%',
          }}
        >
          <Select.Viewport
            className={`${selectorViewport({ border: variant })}`}
          >
            {options.map((option, key) => (
              <>
                <Select.Item
                  key={option.value}
                  className={selectorItem({
                    border: variant,
                    disabled: optionsDisabled(option.value),
                  })}
                  value={option.value}
                  disabled={optionsDisabled(option.value)}
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
                {renderSeparator(key, messageSeparator)}
              </>
            ))}
          </Select.Viewport>
        </ScrollArea>
      </SelectContent>
      {validationMessages && (
        <div className="mt-xs">
          {validationMessages.map((msg, index) => (
            <div key={index} className="flex items-center gap-1">
              <FiAlertCircle className={`text-red-500`} />
              <span
                className={`text-sm ${
                  msg.isValid === false ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {msg.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </Select.Root>
  )
}
