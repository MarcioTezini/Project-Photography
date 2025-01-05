import * as React from 'react'
import * as Toast from '@radix-ui/react-toast'
import MessageBar, { MessageBarProps } from '@/components/atoms/MessageBar'
import { tv } from 'tailwind-variants'
import { FC, useEffect, useRef } from 'react'

type ToastMessageBarProps = {
  open: boolean
  duration?: number
  messageBarProps: MessageBarProps
}

const getStyles = tv({
  slots: {
    root: 'p-xs rounded-sm',
  },
  variants: {
    type: {
      simple: {
        root: 'bg-grey-400',
      },
      info: {
        root: 'bg-notify-info-normal',
      },
      success: {
        root: 'bg-notify-success-normal',
      },
      warning: {
        root: 'bg-notify-alert-normal',
      },
      error: {
        root: 'bg-notify-warning-normal',
      },
    },
  },
})

const ToastDemo: FC<ToastMessageBarProps> = ({
  messageBarProps,
  open,
  duration,
}) => {
  const timerRef = useRef(0)
  const { root } = getStyles()
  const { type, onClose } = messageBarProps

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  useEffect(() => {
    if (open && onClose && duration) {
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        onClose?.()
      }, duration)
    }
  }, [open, duration, onClose])

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root className={root({ type })} open={Boolean(open)}>
        <MessageBar {...messageBarProps} />
      </Toast.Root>
      <Toast.Viewport className="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[340px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
    </Toast.Provider>
  )
}

export default ToastDemo
