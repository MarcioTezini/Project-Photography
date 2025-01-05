import { IGeneralSettingsCell } from '../../type'

interface GeneralSettingsTextProps {
  title: string
  value: boolean
}

const GeneralSettingsText: React.FC<GeneralSettingsTextProps> = ({
  title,
  value,
}) => {
  return (
    <div className="flex items-center text-LABEL-L">
      <p className="font-Bold leading-3">{title}</p>
      <p className="font-Regular leading-3">{value ? 'Sim' : 'Não'}</p>
    </div>
  )
}

export const GeneralSettingsCell: React.FC<IGeneralSettingsCell> = ({
  deposits,
  withdrawals,
  automaticWithdrawals,
}) => {
  return (
    <div>
      <GeneralSettingsText title="Depósitos:&nbsp;" value={deposits} />
      <GeneralSettingsText title="Saques:&nbsp;" value={withdrawals} />
      <GeneralSettingsText
        title="Saques automáticos:&nbsp;"
        value={automaticWithdrawals}
      />
    </div>
  )
}
