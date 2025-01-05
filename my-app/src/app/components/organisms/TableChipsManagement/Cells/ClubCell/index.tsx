import { ClubChips } from '../../type'

export const ChipsClubCell: React.FC<ClubChips> = ({ clubid, clubname }) => {
  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{clubname}</p>
      <p className="text-notify-info-normal leading-3">{clubid}</p>
    </div>
  )
}
