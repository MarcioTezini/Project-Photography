import React, { useState } from 'react'
import Dialog from '@/components/molecules/Dialog'
import useDialogStore from '@/stores/DialogStore'
import FormMyData from '../FormMyData'

const MyDataDialog = () => {
  const { openMyDataDialog, handleCloseDialog } = useDialogStore()
  const [dialogTitle, setDialogTitle] = useState('Excluir Minha Conta')

  return (
    <Dialog
      position="aside"
      title={dialogTitle}
      open={openMyDataDialog}
      onClose={handleCloseDialog}
      className="w-[531px] sm:!h-[545px]"
      isDarkMode
    >
      <FormMyData setTitle={setDialogTitle} />
    </Dialog>
  )
}

export default MyDataDialog
