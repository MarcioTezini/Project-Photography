import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { ClientExtract } from '../../type'

export const ExtractClientCell: React.FC<ClientExtract> = ({
  userDocument,
  userName,
}) => {
  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{userName}</p>
      <p className="text-notify-info-normal leading-3">
        {cpfFormatter.mask(userDocument)}
      </p>
    </div>
  )
}
