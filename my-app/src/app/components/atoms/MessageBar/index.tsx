import React from 'react'
import { FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { IoMdClose } from 'react-icons/io'
import { tv } from 'tailwind-variants'
import Button from '../Button'

export type MessageBarProps = {
  message: string
  onAction?: () => void
  actionLabel?: string
  onClose?: () => void
  type?: 'simple' | 'info' | 'success' | 'warning' | 'error'
}

const getStyles = tv({
  slots: {
    container: 'flex items-center p-xs text-BODY-S',
    leftIcon: 'h-[20px] w-[20px] mr-xxs',
    rightIcon: 'h-[24px] w-[24px]',
    description: 'flex-1',
    button: '',
  },
  variants: {
    type: {
      simple: {
        container: 'bg-grey-400',
        description: 'text-grey-900',
        leftIcon: 'text-grey-900',
        rightIcon: 'text-grey-900',
        button: 'border-grey-900',
      },
      info: {
        container: 'bg-notify-info-normal',
        description: 'text-grey-300',
        leftIcon: 'text-grey-300',
        rightIcon: 'text-grey-300',
        button: 'border-grey-300',
      },
      success: {
        container: 'bg-notify-success-normal',
        description: 'text-grey-300',
        leftIcon: 'text-grey-300',
        rightIcon: 'text-grey-300',
        button: 'border-grey-300',
      },
      warning: {
        container: 'bg-notify-alert-normal',
        description: 'text-grey-900',
        leftIcon: 'text-grey-900',
        rightIcon: 'text-grey-900',
        button: 'border-grey-900',
      },
      error: {
        container: 'bg-notify-warning-normal',
        description: 'text-grey-300',
        leftIcon: 'text-grey-300',
        rightIcon: 'text-grey-300',
        button: 'border-grey-300',
      },
    },
  },
})

const MessageBar: React.FC<MessageBarProps> = ({
  message,
  onAction,
  onClose,
  actionLabel,
  type = 'simple',
}) => {
  const { container, description, leftIcon, rightIcon } = getStyles()

  const IconByType: Record<typeof type, JSX.Element> = {
    simple: <FiInfo className={leftIcon({ type })} />,
    info: <FiInfo className={leftIcon({ type })} />,
    success: <FiCheckCircle className={leftIcon({ type })} />,
    warning: <FiInfo className={leftIcon({ type })} />,
    error: <FiAlertTriangle className={leftIcon({ type })} />,
  }

  return (
    <div className={container({ type })}>
      {IconByType[type]}
      <p className={description({ type })}>{message}</p>
      {onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
      {onClose && (
        <div className="ml-xs cursor-pointer" onClick={onClose}>
          <IoMdClose className={rightIcon({ type })} />
        </div>
      )}
    </div>
  )
}

MessageBar.displayName = 'MessageBar'

export default MessageBar
