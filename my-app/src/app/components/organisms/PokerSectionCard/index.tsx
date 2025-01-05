import Image from 'next/image'

interface PokerSectionCardProps {
  iconSrc: string
  text: React.ReactNode
  iconWidth: number
  iconHeight: number
}

export function PokerSectionCard({
  text,
  iconSrc,
  iconHeight,
  iconWidth,
}: PokerSectionCardProps) {
  return (
    <div className="flex w-full h-[144px] p-s flex-col justify-center items-center gap-xs rounded-[5px] border-2 border-solid border-gaming-main-500">
      <Image src={iconSrc} alt="" width={iconWidth} height={iconHeight} />
      <div className="flex items-center justify-center">{text}</div>
    </div>
  )
}
