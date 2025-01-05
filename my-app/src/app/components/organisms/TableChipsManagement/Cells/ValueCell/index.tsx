import { ValueChips } from '../../type'

export const ChipsValueCell: React.FC<ValueChips> = ({ value }) => {
  const numericValue = typeof value === 'number' ? value : 0
  const sign = numericValue >= 0 ? '+' : '-'

  const formattedValue = Math.abs(numericValue).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className="py-s text-LABEL-L font-Medium">
      <p className="leading-3">{`${sign}${formattedValue}`}</p>
    </div>
  )
}
