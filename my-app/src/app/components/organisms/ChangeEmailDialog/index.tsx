import React from 'react'
import Dialog from '@/components/molecules/Dialog'
import FormChangeEmail from '../FormChangeEmail'
import useChangeEmailDialogStoreDialogStore from '@/stores/DialogChangeEmail'
import { useTranslations } from 'next-intl'

const ChangeEmailDialog = () => {
  const { openChangeEmaillDialog, handleCloseDialog, step } =
    useChangeEmailDialogStoreDialogStore()
  const t = useTranslations()

  return (
    <Dialog
      position="aside"
      title={t('Home.DialogChangeEmail.ChangeEmail')}
      open={openChangeEmaillDialog}
      onClose={handleCloseDialog}
      className={`w-[531px] ${step === 1 ? 'sm:!h-[545px]' : 'sm:!h-[350px]'}`}
      isDarkMode
    >
      <FormChangeEmail />
    </Dialog>
  )
}

export default ChangeEmailDialog
