import React from 'react'
import { toast, ToastContainer, ToastPosition } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiX,
} from 'react-icons/fi'
import { tv } from 'tailwind-variants'

type ToastContentProps = {
  type: 'default' | 'success' | 'error' | 'info' | 'warning'
  message: string
}

const toastClasses = tv({
  base: 'text-BODY-S font-Semibold',
  variants: {
    type: {
      default: 'bg-grey-500 text-grey-900',
      success: 'bg-a-green-80 text-notify-success-darkest',
      error: 'bg-a-red-80 text-grey-300',
      info: 'bg-a-blue-80 text-notify-info-darkest',
      warning: 'bg-a-yellow-80 text-grey-900',
    },
  },
})

const iconClasses = (
  type: 'default' | 'success' | 'error' | 'info' | 'warning',
) => {
  switch (type) {
    case 'default':
      return <FiAlertCircle className="text-grey-900 w-[20px] h-[20px]" />
    case 'success':
      return (
        <FiCheckCircle className="text-notify-success-darkest w-[20px] h-[20px]" />
      )
    case 'error':
      return (
        <FiAlertTriangle className="text-notify-error-darkest w-[20px] h-[20px]" />
      )
    case 'info':
      return (
        <FiAlertCircle className="text-notify-info-darkest w-[20px] h-[20px]" />
      )
    case 'warning':
      return <FiAlertCircle className="text-grey-900 w-[20px] h-[20px]" />
    default:
      return null
  }
}

const ToastContent = ({ type, message }: ToastContentProps) => (
  <div className="flex items-center w-full h-[28px] justify-between gap-s my-s px-s">
    <div className="flex gap-xs items-center">
      {iconClasses(type)}
      <span className="flex-1">{message}</span>
    </div>
    <FiX
      width={28}
      height={28}
      className="cursor-pointer w-[20px] h-[20px]"
      onClick={() => toast.dismiss()}
    />
  </div>
)

export type ToastType = 'default' | 'success' | 'error' | 'info' | 'warning'

export const showToast = (
  type: ToastType,
  message: string,
  autoClose?: number,
  position?: ToastPosition,
) => {
  toast(<ToastContent type={type} message={message} />, {
    type,
    position,
    autoClose,
    bodyClassName: `text-BODY-S font-Semibold ${toastClasses({ type })}`,
    closeButton: false,
    icon: false,
    style: { padding: 0, minHeight: 0 },
    hideProgressBar: true,
  })
}

export const ToastContainerWrapper = () => <ToastContainer />
