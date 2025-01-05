import { DateChip } from '../../type'
import { dateChipsFormatter } from '@/bosons/formatters/dateChipsFormatter'

export const ChipsDateCell: React.FC<DateChip> = ({ date }) => {
  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{dateChipsFormatter.mask(date)}</p>
    </div>
  )
}
