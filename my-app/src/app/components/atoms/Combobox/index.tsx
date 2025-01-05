import React, { useRef, useState, useEffect } from 'react'
import './styles.css'
import { tv } from 'tailwind-variants'
import { FiAlertCircle, FiSearch } from 'react-icons/fi'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import Textfield from '../Textfield'
import Divider from '../Divider'
import { useTranslations } from 'next-intl'
import { useMediaQuery } from 'react-responsive'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'

interface Option {
  value: string
  label: string | React.ReactNode
}

interface ValidationMessage {
  message: string
  isValid?: boolean
}

interface ComboboxProps {
  width?: number
  maxWidth?: boolean
  validationMessages?: ValidationMessage[]
  disabled?: boolean
  placeholder: string
  value: string
  onChange: (value: string) => void
  onClick?: () => void
  options: Option[]
  optionsDisabled?: (value: string) => boolean
  separatorInPosition?: number
  messageSeparator?: string
}

const Combobox = ({
  width,
  maxWidth = false,
  validationMessages,
  disabled = false,
  placeholder,
  value,
  onChange,
  onClick,
  options,
  optionsDisabled = () => false,
  separatorInPosition,
  messageSeparator = '',
}: ComboboxProps) => {
  const t = useTranslations('Components.Combobox')

  const [open, setOpen] = useState(false)
  const [isScrollbarActive, setIsScrollbarActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const [selectedValue, setSelectedValue] = useState(value)

  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isSmallScreen = useMediaQuery({ query: '(max-width: 768px)' })
  const isMediumScreen = useMediaQuery({ query: '(max-width: 1365px)' })
  const { hasUnsavedChanges } = useSaveChangesDialogStore()

  // Sync search term with selected value
  useEffect(() => {
    const selectedOption = options.find((option) => option.value === value)
    setSelectedValue(selectedOption?.value || '')
    setSearchTerm(selectedOption?.label?.toString() || '')
  }, [selectedValue, options, value])

  // Filter options based on search term
  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.label
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    )
  }, [searchTerm, options])

  const handleItemSelect = (selectedValue: string) => {
    setSelectedValue(selectedValue)
    onChange(selectedValue)
    setOpen(false)
  }

  useEffect(() => {
    const updateContentWidth = () => {
      if (triggerRef.current && contentRef.current) {
        // Obtendo a largura real do triggerRef
        const triggerWidth = triggerRef.current.getBoundingClientRect().width
        contentRef.current.style.width = `${triggerWidth}px`
      }
    }

    const observer = new ResizeObserver(updateContentWidth)

    // Observa mudanças no triggerRef
    if (triggerRef.current) {
      observer.observe(triggerRef.current)
    }

    // Atualiza largura no primeiro render
    updateContentWidth()

    return () => {
      if (triggerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(triggerRef.current)
      }
    }
  }, [open])

  const selectorWidth: React.CSSProperties = {
    width: width && !maxWidth ? `${width}px` : '100%',
  }

  const selectorItem = tv({
    base: `flex self-stretch py-[12px] px-xs outline-none text-BODY-XM font-Regular text-grey-700 hover:bg-fichasPay-a-secondary-5 border-[transparent] hover:cursor-pointer hover:border-l-4 hover:border-grey-500`,
    variants: {
      disabled: {
        true: 'cursor-not-allowed text-grey-500',
      },
    },
  })

  const selectorViewport = tv({
    base: `border-t border-b-2 ${isScrollbarActive ? 'border-l-2' : 'border-x-2 rounded-b-xs'} overflow-y-auto border-grey-500 border-t-grey-500`,
  })

  const renderSeparator = (index: number, message: string) => {
    if (separatorInPosition !== index) return null
    return (
      <div className="mt-xs">
        <span className="pl-xs text-LABEL-L font-Semibold text-grey-600">
          {message}
        </span>
        <div className="mx-[5px]">
          <Divider />
        </div>
      </div>
    )
  }

  // Observe scrollbar changes
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        const selectedOption = options.find(
          (option) => option.value === selectedValue,
        )
        setSearchTerm(selectedOption?.label?.toString() || '')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [options, selectedValue])

  useEffect(() => {
    if (open) {
      setSearchTerm('')
    }
  }, [open])

  return (
    <div
      ref={triggerRef}
      style={selectorWidth}
      className="SelectContent hover:cursor-pointer"
      onClick={() => {
        if (onClick && hasUnsavedChanges) {
          onClick() // Executa onClick se passado por prop e hasUnsavedChanges for true
        } else {
          setOpen(!open) // Caso contrário, executa setOpen
        }
      }}
    >
      {/* Textfield for input */}
      <Textfield
        name="combobox"
        value={searchTerm}
        placeholder={placeholder}
        disabled={disabled}
        icon={
          <FiSearch
            className={`${disabled ? 'text-grey-500' : 'text-grey-600'} h-m w-m -ml-xs`}
            onClick={() => {
              if (!onClick) setOpen(true)
            }}
          />
        }
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (!onClick) setOpen(true)
        }}
        inputClassname={open ? 'rounded-b-none' : undefined}
      />

      {/* Dropdown */}
      {open && (
        <div
          ref={contentRef}
          className={`absolute w-full bg-grey-300 shadow-DShadow-Default z-20`}
          style={selectorWidth}
        >
          <ScrollArea
            style={{
              maxHeight: isSmallScreen || isMediumScreen ? '85vh' : '90vh',
              width: '100%',
            }}
          >
            <div
              style={{
                ...selectorWidth,
                maxHeight: isSmallScreen || isMediumScreen ? '85vh' : '90vh',
                overflowY: 'auto',
              }}
              className={`SelectContent hover:cursor-pointer ${selectorViewport()}`}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, key) => (
                  <React.Fragment key={option.value}>
                    <div
                      key={option.value}
                      className={selectorItem({
                        disabled: optionsDisabled(option.value),
                      })}
                      onClick={() => handleItemSelect(option.value)}
                    >
                      {option.label}
                    </div>
                    {separatorInPosition === key && (
                      <>{renderSeparator(key, messageSeparator)} </>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="p-xs text-center text-grey-700">
                  {t('noOptionsFound')}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Validation Messages */}
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
    </div>
  )
}

export default Combobox
