import Button, { ButtonProps } from '@/components/atoms/Button'
import React from 'react'
import { FiArrowLeft } from 'react-icons/fi'

interface DialogButtonProps {
  buttonName: string
  backButtonName?: string
  secondary?: Omit<ButtonProps, 'children'>
  primary?: Omit<ButtonProps, 'children'>
}

export const DialogButton: React.FC<DialogButtonProps> = ({
  buttonName,
  backButtonName,
  primary = { size: 'lg' },
  secondary = { size: 'lg' },
}) => {
  return (
    <div className="flex items-center gap-s justify-center mt-m">
      <Button
        {...secondary}
        type="button"
        preIcon={<FiArrowLeft width={20} height={20} />}
      >
        {backButtonName ?? 'Voltar'}
      </Button>
      <Button {...primary}>{buttonName}</Button>
    </div>
  )
}
