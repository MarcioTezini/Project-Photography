import { ValueApprove } from '../../../type'
export const ValueCell: React.FC<ValueApprove> = ({ amount }) => {
  const numericValue = typeof amount === 'number' ? amount : 0

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
