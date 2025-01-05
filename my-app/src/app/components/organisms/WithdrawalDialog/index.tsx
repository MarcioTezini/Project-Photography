import React from 'react'
import Dialog from '@/components/molecules/Dialog'
import useWithdrawalDialogStore from '@/stores/WithdrawalDialogStore'
import FormWithdrawal from '../FormWithdrawal'

const WithdrawalDialog = () => {
  const { openWithdrawalDialog, handleCloseDialog } = useWithdrawalDialogStore()

  return (
    <Dialog
      position="aside"
      title="Sacar"
      open={openWithdrawalDialog}
      onClose={handleCloseDialog}
      className="w-[531px]"
      isDarkMode
    >
      <FormWithdrawal />
    </Dialog>
  )
}

export default WithdrawalDialog
