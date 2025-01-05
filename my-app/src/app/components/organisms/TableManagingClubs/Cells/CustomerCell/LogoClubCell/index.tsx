import Image from 'next/image'
import { LogoClub } from '../../../type'

export const LogoClubCell: React.FC<LogoClub> = ({ logo }) => {
  return (
    <div className="flex w-[52px] h-[52px] flex-col justify-center items-center gap-xs bg-grey-400 rounded-xl">
      <Image
        className="rounded-xl"
        width={52}
        height={52}
        alt="Logo do clube"
        src={logo}
      />
    </div>
  )
}
