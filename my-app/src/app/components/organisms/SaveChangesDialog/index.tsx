import React from 'react'

import Dialog from '@/components/molecules/Dialog'
import Button from '@/components/atoms/Button'
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { useRouter } from 'next/navigation'

const SaveChangesDialog = () => {
  const router = useRouter()
  const t = useTranslations()
  const {
    targetPage,
    setHasUnsavedChanges,
    isSaveChangesDialogOpen,
    setIsSaveChangesDialogOpen,
    saveWithoutChangesFunction,
    setSaveWithoutChangesFunction,
    onSubmit,
    isClientChanging,
    setIsClientChanging,
  } = useSaveChangesDialogStore()

  const handleSaveAndProceed = async () => {
    if (onSubmit) {
      onSubmit()
      setHasUnsavedChanges(false)
      setIsClientChanging(false)
      setIsSaveChangesDialogOpen(false)
      setSaveWithoutChangesFunction(() => null)
      if (targetPage) {
        router.push(targetPage)
      }
    }
  }

  const handleClose = () => {
    if (targetPage) {
      router.push(targetPage)
      setHasUnsavedChanges(false)
      setIsClientChanging(false)
      setIsSaveChangesDialogOpen(false)
    } else {
      setHasUnsavedChanges(false)
      setIsClientChanging(false)
      setIsSaveChangesDialogOpen(false)

      if (saveWithoutChangesFunction) {
        saveWithoutChangesFunction()
        setIsClientChanging(false)
        setSaveWithoutChangesFunction(() => null)
      }
    }
  }

  return (
    <Dialog
      title={
        isClientChanging
          ? t('DialogGlobal.isClientChangingTitle')
          : t('DialogGlobal.title')
      }
      open={isSaveChangesDialogOpen}
      onClose={handleClose}
      className="sm:max-w-[328px] max-w-[400px]"
      removeHeaderPaddingX
    >
      <div className="flex flex-col items-center justify-center gap-s my-xm">
        <FiAlertTriangle size={64} className="text-notify-alert-normal" />
        <p className="text-BODY-XM font-Regular text-grey-900 text-center px-s w-10/12">
          {isClientChanging
            ? t('DialogGlobal.isClientChangingUnsavedChanges')
            : t('DialogGlobal.unsavedChanges')}
        </p>
        <p className="text-BODY-XM text-grey-900 font-Bold text-center">
          {isClientChanging
            ? t('DialogGlobal.isClientChangingLeave')
            : t('DialogGlobal.leave')}
        </p>
        <div className="flex justify-center items-center gap-s self-stretch mt-m">
          <Button
            className="cursor-pointer"
            preIcon={<FiArrowLeft className="w-[16px] h-[16px]" />}
            variant="text"
            onClick={handleClose}
          >
            {isClientChanging
              ? t('DialogGlobal.isClientChangingExit')
              : t('DialogGlobal.exit')}
          </Button>
          <Button variant="success" onClick={handleSaveAndProceed}>
            {isClientChanging
              ? t('DialogGlobal.isClientChangingSave')
              : t('DialogGlobal.save')}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default SaveChangesDialog
