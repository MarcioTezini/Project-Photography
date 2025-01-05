import { ClubExtract } from '../../type'

export const ExtractClubCell: React.FC<ClubExtract> = ({
  clubId,
  clubName,
}) => {
  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{clubName}</p>
      <p className="text-notify-info-normal leading-3">{clubId}</p>
    </div>
  )
}
