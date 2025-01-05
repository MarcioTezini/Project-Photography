'use client'

import Image, { StaticImageData } from 'next/image'
import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import * as Select from '@radix-ui/react-select'
import BR from '../../../../public/images/flags/br.svg'
import ESP from '../../../../public/images/flags/esp.svg'
import EUA from '../../../../public/images/flags/eua.svg'
import rightArrow from '../../../../public/images/polygons/polygon-1.svg'
import bottomArrow from '../../../../public/images/polygons/polygon-2.svg'

interface Country {
  id: number
  value: string
  avatar: StaticImageData
}

const COUNTRIES: Country[] = [
  { id: 1, value: 'pt', avatar: BR },
  { id: 2, value: 'es', avatar: ESP },
  { id: 3, value: 'en', avatar: EUA },
]

interface CountryFlagProps {
  src: StaticImageData
  alt: string
}

function CountryFlag({ src, alt }: CountryFlagProps) {
  return <Image src={src} alt={alt} width={38} height={25} />
}

interface DropdownArrowProps {
  isOpen: boolean
}

function DropdownArrow({ isOpen }: DropdownArrowProps) {
  const arrowSrc = isOpen ? bottomArrow : rightArrow
  return <Image src={arrowSrc} alt="dropdown" width={12} height={12} />
}

export default function LanguageSelector() {
  const currentLocale = useLocale()

  const [selectedCountry, setSelectedCountry] = useState<Country>(
    () =>
      COUNTRIES.find((country) => country.value === currentLocale) ||
      COUNTRIES[0],
  )

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleLocaleChange = (value: string) => {
    const selected = COUNTRIES.find((country) => country.value === value)
    if (selected) {
      setSelectedCountry(selected)
      window.location.href = `/${value}`
    }
  }

  useEffect(() => {
    const activeCountry = COUNTRIES.find(
      (country) => country.value === currentLocale,
    )
    if (activeCountry) {
      setSelectedCountry(activeCountry)
    }
  }, [currentLocale])

  useEffect(() => {
    if (isOpen) {
      document.body.style.setProperty('overflow-y', 'auto', 'important')
      document.body.style.setProperty('margin-right', '0', 'important')
    } else {
      document.body.style.removeProperty('overflow-y')
    }
  }, [isOpen])

  return (
    <Select.Root
      value={selectedCountry.value}
      onValueChange={handleLocaleChange}
      onOpenChange={setIsOpen}
    >
      <Select.Trigger className="relative bg-transparent cursor-default py-xxs pl-xs pr-xxm flex items-center outline-none">
        <Select.Value>
          <CountryFlag
            src={selectedCountry.avatar}
            alt="Selected country flag"
          />
        </Select.Value>
        <Select.Icon className="pointer-events-none absolute inset-y-0 right-0 ml-[12px] flex items-center pr-xs">
          <DropdownArrow isOpen={isOpen} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="absolute z-20 rounded-sm bg-grey-800 top-xxxm w-l">
          <Select.Viewport>
            {COUNTRIES.filter(
              (country) => country.id !== selectedCountry.id,
            ).map((country, index, arr) => (
              <Select.Item
                key={country.id}
                value={country.value}
                className={`cursor-default select-none py-xs pl-xs pr-xs flex items-center outline-none hover:bg-grey-700
                  ${index === 0 ? 'hover:rounded-t-sm' : ''}
                  ${index === arr.length - 1 ? 'hover:rounded-b-sm' : ''}`}
              >
                <Select.ItemText>
                  <CountryFlag
                    src={country.avatar}
                    alt={`${country.value} flag`}
                  />
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
