import Button from '@/components/atoms/Button'
import dynamic from 'next/dynamic'
import { FiCheck } from 'react-icons/fi'

const MediaQuery = dynamic(() => import('react-responsive'), {
  ssr: false,
})

interface TableSucessButtonProps {
  name: string
  onClick?: () => void
}

export const TableSucessButton: React.FC<TableSucessButtonProps> = ({
  name,
  onClick,
}) => {
  return (
    <>
      <MediaQuery minWidth={680}>
        <Button
          variant="success"
          size="sm"
          addIcon={<FiCheck size={16} onClick={onClick} />}
        >
          {name}
        </Button>
      </MediaQuery>
      <MediaQuery maxWidth={679}>
        <Button variant="success" size="sm">
          <FiCheck size={16} onClick={onClick} />
        </Button>
      </MediaQuery>
    </>
  )
}
