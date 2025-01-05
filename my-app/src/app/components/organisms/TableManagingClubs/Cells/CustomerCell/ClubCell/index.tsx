import { Club } from '../../../type'

export const ClubCell: React.FC<Club> = ({ name, slotID }) => {
  return (
    <div className="py-s text-LABEL-L font-Medium">
      <p className="leading-3">{name}</p>
      <p className="text-notify-info-normal leading-3">{slotID}</p>
    </div>
  )
}
