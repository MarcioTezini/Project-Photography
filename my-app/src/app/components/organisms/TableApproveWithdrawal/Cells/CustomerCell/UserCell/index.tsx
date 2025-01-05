import { cnpjFormatter } from '@/bosons/formatters/cnpjFormater'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { User } from '../../../type'

export const UserCell: React.FC<User> = ({ userDocument, userName }) => {
  const formatDocument = (userDocument: string) => {
    if (userDocument.length === 11 || undefined) {
      return cpfFormatter.mask(userDocument)
    } else if (userDocument.length === 14) {
      return cnpjFormatter.mask(userDocument)
    }
    return userDocument
  }

  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{userName}</p>
      <p className="text-notify-info-normal leading-3">
        {formatDocument(userDocument)}
      </p>
    </div>
  )
}
