import { Root, SeparatorProps } from '@radix-ui/react-separator'
import clsx from 'clsx'

interface DividerProps extends SeparatorProps {
  className?: string
}

export default function Divider({
  className,
  ...rest
}: DividerProps): JSX.Element {
  return (
    <Root
      {...rest}
      className={clsx(
        'bg-grey-600 data-[orientation=horizontal]:h-[0.5px] data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-[0.5px]',
        className,
      )}
    />
  )
}
