import { ValueWallet } from '../../../type'

export const ValueWalletCell: React.FC<ValueWallet> = ({ value }) => {
  const numericValue = typeof value === 'number' ? value : 0

  const isNegative = numericValue < 0

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs(numericValue))

  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">
        {isNegative ? `- ${formattedValue}` : formattedValue}
      </p>
    </div>
  )
}
