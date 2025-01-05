import { DateApproveWithdrawal } from '../../../type'
import { dateFormatterPt } from '@/bosons/dateFormatterPt'

export const DateApproveWithdrawalCell: React.FC<DateApproveWithdrawal> = ({
  date,
}) => {
  return (
    <div className="py-s text-LABEL-L font-Medium">
      <p className="leading-3">{dateFormatterPt.mask(date)}</p>
    </div>
  )
}
