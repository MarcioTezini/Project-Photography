import { Player } from '../../../type'

export const PlayerCell: React.FC<Player> = ({ playerNick, playerId }) => {
  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{playerNick}</p>
      <p className="text-notify-info-normal leading-3">{playerId}</p>
    </div>
  )
}
