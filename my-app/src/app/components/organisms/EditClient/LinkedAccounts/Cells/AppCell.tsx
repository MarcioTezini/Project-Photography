import React from 'react'

interface AppCellProps {
  name: string
}

export const AppCell: React.FC<AppCellProps> = ({ name }) => {
  const color =
    name === 'Suprema Poker' ? 'bg-gaming-a-main-50' : 'bg-cacheta-a-main-50'

  return (
    <div
      className={`text-nowrap w-fit rounded-md text-grey-900 text-LABEL-L font-Bold py-xxs px-xs ${color}`}
    >
      {name}
    </div>
  )
}
