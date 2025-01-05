'use client'

import { ReactSVG } from 'react-svg'
import Image from 'next/image'

interface ChipProps {
  iconSrc: string
  text: React.ReactNode
  iconWidth: number
  iconHeight: number
}

export function Chip({ text, iconSrc, iconHeight, iconWidth }: ChipProps) {
  const fillColor = 'var(--color-fichasPay-main-400)'

  const isSvg = iconSrc.trim().startsWith('<svg')

  return (
    <div className="flex p-xm flex-col pt-xl justify-center items-center gap-[10px] shrink-0 rounded-lg border-2 border-solid border-fichasPay-main-400 xl:mt-xm mt-[64px] md:mt-[104px] sm:mt-[104px]">
      {isSvg ? (
        <div className="flex mt-[-160px] w-[180px] h-[180px] p-xm justify-center items-center gap-[10px] shrink-0 rounded-xxl bg-chip-icon-gradient">
          <ReactSVG
            src={`data:image/svg+xml;base64,${btoa(iconSrc)}`}
            beforeInjection={(svg) => {
              svg.setAttribute('width', `${iconWidth}`)
              svg.setAttribute('height', `${iconHeight}`)
              svg.querySelectorAll('path').forEach((path) => {
                path.setAttribute('fill', fillColor)
              })
            }}
          />
        </div>
      ) : (
        <Image
          src={iconSrc}
          alt="icon"
          width={180}
          height={180}
          className="flex h-[180px] w-[180px] mt-[-160px]"
        />
      )}

      {text}
    </div>
  )
}
