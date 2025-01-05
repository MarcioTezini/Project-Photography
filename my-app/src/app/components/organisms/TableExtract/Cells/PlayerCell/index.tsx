import { PlayerExtract } from '../../type'

export const ExtractPlayerCell: React.FC<PlayerExtract> = ({
  playerId,
  playerNick,
}) => {
  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{playerNick}</p>
      <p className="text-notify-info-normal leading-3">{playerId}</p>
    </div>
  )
}
