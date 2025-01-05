import React from 'react'
import { tv } from 'tailwind-variants'

const card = tv({
  base: 'flex flex-col bg-grey-300 text-grey-900 font-Regular',
  variants: {
    padding: {
      none: 'p-0',
      small: 'p-xxs',
      medium: 'p-xs',
      large: 'p-s',
      xlarge: 'p-m',
    },
    borderRadius: {
      none: 'rounded-none',
      small: 'rounded-xxs',
      medium: 'rounded-xs',
      large: 'rounded-sm',
      xlarge: 'rounded-md',
    },
    boxShadow: {
      none: 'shadow-none',
      small: 'shadow-DShadow-S',
      medium: 'shadow-DShadow-Default',
      large: 'shadow-DShadow-L',
      special: 'shadow-DShadow-Special',
    },
    margin: {
      none: 'my-0',
      small: 'my-xxs',
      medium: 'my-xs',
      large: 'my-s',
      xlarge: 'my-m',
    },
  },
  defaultVariants: {
    padding: 'medium',
    borderRadius: 'medium',
    boxShadow: 'medium',
    border: 'default',
    margin: 'large',
  },
})

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'small' | 'medium' | 'large' | 'xlarge'
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'xlarge'
  boxShadow?: 'none' | 'small' | 'medium' | 'large' | 'special'
  margin?: 'none' | 'small' | 'medium' | 'large' | 'xlarge'
}

const Card: React.FC<CardProps> = ({
  padding,
  borderRadius,
  boxShadow,
  margin,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      className={card({
        padding,
        borderRadius,
        boxShadow,
        margin,
      })}
    >
      {children}
    </div>
  )
}

export default Card
