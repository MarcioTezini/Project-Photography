import Button from '@/components/atoms/Button'
import dynamic from 'next/dynamic'
import { FiTrash2 } from 'react-icons/fi'

const MediaQuery = dynamic(() => import('react-responsive'), {
  ssr: false,
})

interface TableWarningButtonProps {
  name: string
  onClick?: () => void
  icon?: React.ReactNode
  disabled?: boolean
}

export const TableWarningButton: React.FC<TableWarningButtonProps> = ({
  name,
  onClick,
  icon,
  disabled = false,
}) => {
  const defaultIcon = <FiTrash2 size={16} className="text-grey-300" />

  return (
    <>
      <MediaQuery minWidth={680}>
        <Button
          variant="warning"
          size="sm"
          onClick={disabled ? undefined : onClick}
          addIcon={icon || defaultIcon}
          disabled={disabled}
          className={
            disabled
              ? 'bg-red-100 text-gray-300 border-red-100 cursor-not-allowed'
              : ''
          }
        >
          <label className="text-grey-300">{name}</label>
        </Button>
      </MediaQuery>
      <MediaQuery maxWidth={679}>
        <Button
          variant="warning"
          size="sm"
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          className={
            disabled
              ? 'bg-red-100 text-gray-300 border-red-100 cursor-not-allowed'
              : ''
          }
        >
          {icon || defaultIcon}
        </Button>
      </MediaQuery>
    </>
  )
}
