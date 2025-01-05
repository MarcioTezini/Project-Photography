import Button from '@/components/atoms/Button'
import dynamic from 'next/dynamic'
import { FiEdit } from 'react-icons/fi'

const MediaQuery = dynamic(() => import('react-responsive'), {
  ssr: false,
})

interface TableEditButtonProps {
  name: string
  onClick?: () => void
}

export const TableEditButton: React.FC<TableEditButtonProps> = ({
  name,
  onClick,
}) => {
  return (
    <>
      <MediaQuery minWidth={680}>
        <Button
          variant="primary"
          size="sm"
          onClick={onClick}
          addIcon={<FiEdit size={16} onClick={onClick} />}
        >
          {name}
        </Button>
      </MediaQuery>
      <MediaQuery maxWidth={679}>
        <Button variant="primary" size="sm" onClick={onClick}>
          <FiEdit size={16} onClick={onClick} />
        </Button>
      </MediaQuery>
    </>
  )
}
