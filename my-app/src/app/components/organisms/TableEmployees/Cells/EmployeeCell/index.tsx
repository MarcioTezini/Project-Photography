import { IEmployeeCell } from '../../type'

export const EmployeeCell: React.FC<IEmployeeCell> = ({ name, document }) => {
  return (
    <div className="py-s text-LABEL-L font-Medium">
      <p className="leading-3">{name}</p>
      <p className="text-notify-info-normal leading-3">{document}</p>
    </div>
  )
}
