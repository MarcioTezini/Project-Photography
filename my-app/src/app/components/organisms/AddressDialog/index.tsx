import React from 'react'
import Dialog from '@/components/molecules/Dialog'
import useAddressDialogStore from '@/stores/AddressDialogStore'
import FormHomeAddress from '../FormHomeAddress'
import { useTranslations } from 'next-intl'

const AddressDialog = () => {
  const t = useTranslations()
  const { openAddressDialog, handleCloseDialog } = useAddressDialogStore()

  return (
    <Dialog
      position="aside"
      title={t('Home.DialogAddress.title')}
      open={openAddressDialog}
      onClose={handleCloseDialog}
      className="w-[531px] sm:!h-[518px]"
      isDarkMode
      removeHeaderPaddingX
    >
      <FormHomeAddress />
    </Dialog>
  )
}

export default AddressDialog
