import CustomColorPicker from '@/components/molecules/ColorPicker'
import { useState, useRef, useEffect } from 'react'
import { ColorResult } from 'react-color'
import { FiEdit } from 'react-icons/fi'

type ColorItemProps = {
  colorValue: string
  onClickEdit: () => void
  active: boolean
  editButtonRef: (el: HTMLButtonElement | null) => void
  pickerRef: (el: HTMLDivElement | null) => void
  onColorChange: (color: ColorResult) => void
  text: string
  variant: string
  spaceRight?: string
}

export const ColorItem = ({
  colorValue,
  onClickEdit,
  active,
  editButtonRef,
  pickerRef,
  onColorChange,
  text,
  variant,
  spaceRight,
}: ColorItemProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(active)
  const pickerContainerRef = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (pickerContainerRef.current?.contains(event.target as Node)) {
        isDraggingRef.current = true
      } else {
        setIsPickerOpen(false)
      }
    }

    const handlePointerUp = () => {
      isDraggingRef.current = false
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('pointerup', handlePointerUp)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  useEffect(() => {
    setIsPickerOpen(active)
  }, [active])

  const handleColorPickerClick = () => {
    setIsPickerOpen((prev) => !prev)
    onClickEdit()
  }

  const variantClasses: { [key: string]: string } = {
    main: 'min-w-[286px]',
    secondary: 'min-w-[248px]',
    highlight: 'min-w-[248px]',
    grey: 'min-w-[106px]',
    warning: 'min-w-[106px]',
    alert: 'min-w-[106px]',
    success: 'min-w-[106px]',
    info: 'min-w-[106px]',
  }

  const marginRight = `sm:right-xm md:right-xm ${spaceRight ? 'right-[-264px]' : 'right-xm'}`

  return (
    <div className="flex flex-col items-start gap-xs relative w-full">
      <div
        className={`${variantClasses[variant]} sm:min-w-[248px] h-[32px] self-stretch rounded-sm`}
        style={{ backgroundColor: colorValue }}
      ></div>
      <div
        className={`flex ${variantClasses[variant]} sm:min-w-[248px] justify-between w-full`}
      >
        <div className="text-grey-900 text-BODY-L font-Regular leading-6">
          {text}
        </div>
        <div className="relative">
          <button
            ref={editButtonRef}
            onClick={handleColorPickerClick}
            className={`transition-colors duration-300 ${
              isPickerOpen ? 'text-fichasPay-main-400' : 'text-grey-900'
            }`}
          >
            <FiEdit className="w-m h-m" />
          </button>
        </div>
      </div>
      <div className="text-grey-600 text-BODY-XM not-italic font-Regular leading-4 uppercase">
        {colorValue}
      </div>
      {isPickerOpen && (
        <div
          ref={(el) => {
            pickerRef(el)
            pickerContainerRef.current = el
          }}
          className={`absolute top-[42px] ${marginRight} z-10`}
        >
          <CustomColorPicker color={colorValue} onChange={onColorChange} />
        </div>
      )}
    </div>
  )
}
