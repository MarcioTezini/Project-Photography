import React, { useEffect } from 'react'
import ModalHeader from './Header'
import ModalFooter from './Footer'
import ModalContent from './Content'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  backgroundColor?: string
  boxShadowColor?: string
  boxShadowOpacity?: number
  backdropOpacity?: number
  backdropColor?: string
  position?: 'top' | 'center' | 'bottom' | 'left' | 'right'
  borderRadius?: 'rounded-none' | 'rounded-sm' | 'rounded-lg'
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'medium',
  backgroundColor = 'white',
  boxShadowColor = 'rgba(0, 0, 0, 0.5)',
  boxShadowOpacity = 1,
  backdropOpacity = 0.75,
  backdropColor = 'gray-500',
  position = 'center',
  borderRadius = 'rounded-sm',
}) => {
  const modalSize = `modal-${size}`
  const modalPosition = `modal-${position}`

  const modalStyle = {
    backgroundColor,
    boxShadow: `0px 0px 10px ${boxShadowColor}`,
    opacity: boxShadowOpacity,
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div
          className={`fixed inset-0 ${backdropColor}`}
          style={{ opacity: backdropOpacity }}
          onClick={onClose}
        ></div>
        <div className={`relative ${modalPosition} ${modalSize}`}>
          <div
            className={`bg-white ${borderRadius} shadow-lg max-w-lg w-full`}
            style={modalStyle}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Modal, ModalHeader, ModalFooter, ModalContent }
