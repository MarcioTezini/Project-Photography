import { TypesWallet } from '../../../type'

export const OperationCell: React.FC<TypesWallet> = ({ type, operation }) => {
  const formatterType = (type: string, operation: string) => {
    if (type === 'tax') {
      return (
        <div className="inline-flex px-xs py-xxs justify-center items-center gap-xs rounded-xxl font-Bold text-center bg-a-yellow-50 text-notify-alert-darkest">
          <p className="leading-3">Taxa</p>
        </div>
      )
    } else {
      if (operation === 'deposit' && type === 'normal') {
        return (
          <div className="inline-flex px-xs py-xxs justify-center items-center gap-xs rounded-xxl font-Bold text-center bg-a-green-50 text-notify-success-darkest">
            <p className="leading-3">Depósito</p>
          </div>
        )
      } else if (operation === 'withdraw' && type === 'normal') {
        return (
          <div className="inline-flex px-xs py-xxs justify-center items-center gap-xs rounded-xxl font-Bold text-center bg-a-red-50 text-notify-warning-darkest">
            <p>Saque</p>
          </div>
        )
      }
    }
  }

  return formatterType(type, operation)
}
