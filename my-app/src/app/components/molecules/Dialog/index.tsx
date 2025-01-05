'use client'

import * as PrimitiveDialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { forwardRef, ReactNode, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { useMediaQuery } from 'react-responsive'
import './styles.css'

interface DialogProps extends PrimitiveDialog.DialogProps {
  position?: 'center' | 'aside'
  fixedOnBottomInPositionCenter?: boolean
  title?: string
  children: ReactNode
  className?: string
  onClose: () => void
  headerContent?: ReactNode
  footerContent?: ReactNode
  maxHeightInSm?: boolean
  alternativeCloseIconColor?: boolean
  removeHeaderPaddingX?: boolean
  maxWidthInSm?: boolean
  isDarkMode?: boolean
  disableOverlay?: boolean
  hideCloseButton?: boolean
}

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      title,
      children,
      className,
      onClose,
      position = 'center',
      fixedOnBottomInPositionCenter,
      headerContent,
      footerContent,
      alternativeCloseIconColor = false,
      maxHeightInSm,
      removeHeaderPaddingX = false,
      maxWidthInSm = false,
      isDarkMode = false,
      disableOverlay = false,
      hideCloseButton = false,
      ...props
    },
    ref,
  ) => {
    const isSmallScreen = useMediaQuery({ query: '(max-width: 679px)' })

    useEffect(() => {
      if (props.open === true) {
        setTimeout(() => (document.body.style.pointerEvents = ''), 0)
      }
    }, [props.open])

    return (
      <PrimitiveDialog.Root {...props}>
        <PrimitiveDialog.Portal>
          {!disableOverlay && (
            <PrimitiveDialog.Overlay
              className={`fixed inset-0 bg-a-black-50 z-20 ${isDarkMode ? 'bg-opacity-5' : ''}`}
            />
          )}
          <PrimitiveDialog.Content
            aria-describedby={undefined}
            ref={ref}
            className={clsx(
              `${isDarkMode ? 'bg-grey-900' : 'bg-grey-300'} shadow-DShadow-L outline-none z-20 ${removeHeaderPaddingX ? 'pt-xs' : 'p-xs'}
              fixed right-0 bg-white shadow-lg`,
              {
                'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[10px] sm:w-11/12':
                  position === 'center' && !maxWidthInSm,
                'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[10px] sm:w-full':
                  position === 'center' && maxWidthInSm,
                'sm:-translate-y-0 rounded-b-none sm:bottom-0 sm:top-auto':
                  position === 'center' &&
                  fixedOnBottomInPositionCenter &&
                  isSmallScreen,
                'fixed sm:top-[unset] top-0 sm:bottom-0 right-0 h-full sm:h-[90%] sm:w-full sm:right-0':
                  position === 'aside' && !(isSmallScreen && maxHeightInSm),
                'fixed top-0 sm:bottom-0 right-0 h-full sm:h-[100%] sm:w-full sm:right-0 rounded-none':
                  position === 'aside' && isSmallScreen && maxHeightInSm,
                'rounded-l-sm sm:rounded-t-sm':
                  position === 'aside' && !(isSmallScreen && maxHeightInSm),
              },
              className,
            )}
            asChild
          >
            <motion.div
              ref={ref}
              initial={
                position === 'aside'
                  ? isSmallScreen
                    ? { y: '100%' }
                    : { x: '100%' }
                  : {}
              }
              animate={
                position === 'aside'
                  ? isSmallScreen
                    ? { y: '0%' }
                    : { x: '0%' }
                  : {}
              }
              exit={
                position === 'aside'
                  ? isSmallScreen
                    ? { y: '100%' }
                    : { x: '100%' }
                  : {}
              }
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <PrimitiveDialog.Title
                className={`relative flex ${headerContent ? 'justify-between' : 'justify-center'} items-center text-BODY-M font-Bold min-h-[54px]
                ${
                  !headerContent &&
                  `border-b border-solid
                  ${isDarkMode ? 'border-grey-800' : 'border-grey-500'}`
                }`}
              >
                {!headerContent && (
                  <span
                    className={isDarkMode ? 'text-grey-300' : 'text-grey-900'}
                  >
                    {title}
                  </span>
                )}
                {headerContent}
                {!hideCloseButton && (
                  <PrimitiveDialog.Close
                    asChild
                    className="absolute right-xs p-[10px] outline-none"
                  >
                    <button onClick={onClose}>
                      <FiX
                        className={`cursor-pointer w-[26px] h-[26px] ${
                          alternativeCloseIconColor
                            ? 'text-grey-300'
                            : `text-grey-${isDarkMode ? '600' : '700'}`
                        }`}
                      />
                    </button>
                  </PrimitiveDialog.Close>
                )}
              </PrimitiveDialog.Title>
              <div className="scrollbar-custom overflow-auto h-full">
                {children}
              </div>
              {footerContent && (
                <div className="sm:pt-xm sm:pb-l pb-xm w-full">
                  {footerContent}
                </div>
              )}
            </motion.div>
          </PrimitiveDialog.Content>
        </PrimitiveDialog.Portal>
      </PrimitiveDialog.Root>
    )
  },
)

Dialog.displayName = 'Dialog'

export default Dialog
