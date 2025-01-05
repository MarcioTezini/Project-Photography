import { DateWallet } from '../../../type'
import { dateFormatterPt } from '@/bosons/dateFormatterPt'

export const DateWalletCell: React.FC<DateWallet> = ({ requestdate }) => {
  return (
    <div className="py-s text-LABEL-L font-Medium">
      <p className="leading-3">{dateFormatterPt.mask(requestdate)}</p>
    </div>
  )
}
