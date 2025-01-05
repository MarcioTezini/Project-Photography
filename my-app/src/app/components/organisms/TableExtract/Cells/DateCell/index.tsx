import { dateFormatterPt } from '@/bosons/dateFormatterPt'
import { DateExtract } from '../../type'

export const ExtractDateCell: React.FC<DateExtract> = ({ date }) => {
  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{dateFormatterPt.mask(date)}</p>
    </div>
  )
}
