import React from 'react'

export interface ICompositeCell {
  name: string
  id: number
}
export const CompositeCell: React.FC<ICompositeCell> = ({ id, name }) => {
  return (
    <div className="text-LABEL-L font-Medium">
      <p className="leading-3">{name}</p>
      <p className="text-notify-info-normal leading-3">{id}</p>
    </div>
  )
}
