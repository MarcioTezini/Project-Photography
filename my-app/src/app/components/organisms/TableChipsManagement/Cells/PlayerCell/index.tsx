import { PlayerChips } from '../../type'

export const ChipsPlayerCell: React.FC<PlayerChips> = ({
  playerid,
  playernick,
}) => {
  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{playernick}</p>
      <p className="text-notify-info-normal leading-3">{playerid}</p>
    </div>
  )
}
