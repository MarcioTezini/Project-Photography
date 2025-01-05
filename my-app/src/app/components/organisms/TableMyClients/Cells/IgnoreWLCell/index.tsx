import { IIgnoreWlCell } from '../../type'

interface IgnoreTextProps {
  title: string
  value: boolean
}

const IgnoreText: React.FC<IgnoreTextProps> = ({ title, value }) => {
  return (
    <div className="flex items-center text-LABEL-L">
      <p className="font-Bold leading-3">{title}</p>
      <p className="font-Regular leading-3">{value ? 'Sim' : 'Não'}</p>
    </div>
  )
}

export const IgnoreWLCell: React.FC<IIgnoreWlCell> = ({ poker, cacheta }) => {
  return (
    <div>
      <IgnoreText title="Poker:&nbsp;" value={poker} />
      <IgnoreText title="Cacheta:&nbsp;" value={cacheta} />
    </div>
  )
}
