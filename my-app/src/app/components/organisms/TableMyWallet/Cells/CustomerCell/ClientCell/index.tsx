import { cnpjFormatter } from '@/bosons/formatters/cnpjFormater'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { Client } from '../../../type'

export const ClientCell: React.FC<Client> = ({ document, clientName }) => {
  const formatDocument = (document: string) => {
    if (document.length === 11) {
      return cpfFormatter.mask(document)
    } else if (document.length === 14) {
      return cnpjFormatter.mask(document)
    }
    return document
  }

  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{clientName}</p>
      <p className="text-notify-info-normal leading-3">
        {formatDocument(document)}
      </p>
    </div>
  )
}
