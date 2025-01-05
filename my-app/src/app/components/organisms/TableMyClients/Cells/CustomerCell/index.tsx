import { IClientCell } from '../../type'

export const CustomerCell: React.FC<IClientCell> = ({
  name,
  documentNumber,
  phone,
}) => {
  return (
    <div className="py-s text-LABEL-L font-Medium">
      <p className="leading-3">{name}</p>
      <p className="text-notify-info-normal leading-3">{documentNumber}</p>
      <p className="text-notify-info-normal leading-3">{phone}</p>
    </div>
  )
}
