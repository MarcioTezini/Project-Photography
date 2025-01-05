import { Tooltip } from '@/components/atoms/Tooltip'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { FiAlertCircle } from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import { ColorItem } from '@/components/atoms/ColorItem'
import { useRef, useState } from 'react'
import { ColorResult } from 'react-color'
import { IColors } from '@/components/templates/ColorsTemplate'

interface ColorSectionProps {
  title: string
  section: string
  colorArray: string[]
  variant:
    | 'main'
    | 'secondary'
    | 'highlight'
    | 'grey'
    | 'warning'
    | 'alert'
    | 'success'
    | 'info'
  colorValue: { [key: string]: string } | string
  colors: IColors
  handleColorChange: (path: string[], color: ColorResult) => void
  spaceRight?: string
}

export const ColorSection: React.FC<ColorSectionProps> = ({
  title,
  section,
  colorArray,
  variant,
  colors,
  handleColorChange,
  spaceRight,
}) => {
  const [activePicker, setActivePicker] = useState<string | null>(null)
  const pickerRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const editButtonRefs = useRef<Map<string, HTMLButtonElement | null>>(
    new Map(),
  )
  const t = useTranslations()

  const toggleColorPicker = (colorKey: string) => {
    setActivePicker((prevKey) => (prevKey === colorKey ? null : colorKey))
  }

  const getColorValue = <T extends object>(
    colors: T,
    path: string[],
  ): string => {
    const result = path.reduce((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, unknown>)[key]
      }
      return undefined
    }, colors as unknown)

    return typeof result === 'string' ? result : ''
  }

  return (
    <div className="flex p-s w-full flex-col items-start gap-s self-stretch rounded-sm bg-grey-300 shadow-DShadow-Default">
      <div className="flex items-center gap-xs">
        <div className="text-grey-900 text-BODY-L font-Bold leading-6">
          {title}
        </div>
        <TooltipPrimitive.Provider delayDuration={0}>
          <Tooltip
            content={
              <p>
                {t(
                  `Panel.Colors.tooltip${variant.charAt(0).toUpperCase() + variant.slice(1)}`,
                )}
              </p>
            }
            defaultOpen={false}
            contentMarginLeft="110px"
          >
            <FiAlertCircle className="w-6 h-6 cursor-pointer" />
          </Tooltip>
        </TooltipPrimitive.Provider>
      </div>
      <div className="flex flex-wrap lg:flex-nowrap w-full gap-xm md:gap-s justify-between">
        {colorArray.map((colorName, index) => {
          const path =
            section === variant
              ? [section, colorName]
              : [section, variant, colorName]

          const text =
            section === 'gaming'
              ? t(`Panel.Colors.gaming.${variant}.${colorName}`)
              : colorName

          return (
            <ColorItem
              key={colorName}
              variant={variant}
              text={text}
              colorValue={getColorValue(colors, path)}
              spaceRight={index === 0 ? spaceRight : undefined}
              onClickEdit={() =>
                toggleColorPicker(
                  colorName +
                    `${variant.charAt(0).toUpperCase() + variant.slice(1)}`,
                )
              }
              active={
                activePicker ===
                colorName +
                  `${variant.charAt(0).toUpperCase() + variant.slice(1)}`
              }
              editButtonRef={(el) => {
                if (el) {
                  editButtonRefs.current.set(
                    colorName +
                      `${variant.charAt(0).toUpperCase() + variant.slice(1)}`,
                    el,
                  )
                }
              }}
              pickerRef={(el) => {
                if (el) {
                  pickerRefs.current.set(
                    colorName +
                      `${variant.charAt(0).toUpperCase() + variant.slice(1)}`,
                    el,
                  )
                } else {
                  pickerRefs.current.delete(
                    colorName +
                      `${variant.charAt(0).toUpperCase() + variant.slice(1)}`,
                  )
                }
              }}
              onColorChange={(color: ColorResult) => {
                handleColorChange(path, color)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
