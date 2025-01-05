import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import { FiArrowLeft } from 'react-icons/fi'
import Textfield from '@/components/atoms/Textfield'
import { useTranslations } from 'next-intl'
import { showToast } from '@/components/atoms/Toast'
import { registerAccount } from '@/services/account/account'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'

interface FormAccountProps {
  setOpenAddAccountDialog: (open: boolean) => void
  onClose: () => void
  refreshData: () => void
}

export function FormAccounts({
  refreshData,
  onClose,
  setOpenAddAccountDialog,
}: FormAccountProps) {
  const t = useTranslations()

  const {
    setOnSubmit,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    setIsSaveChangesDialogOpen,
  } = useSaveChangesDialogStore()

  const formAccountSchema = z.object({
    account: z.string().min(1, t('Errors.accountRequired')),
  })

  type FormRegisterAccountSchema = z.infer<typeof formAccountSchema>

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormRegisterAccountSchema>({
    resolver: zodResolver(formAccountSchema),
    mode: 'onChange',
  })

  const acconutValue = watch('account')

  const handleFormRegisterAccount = async (data: FormRegisterAccountSchema) => {
    try {
      await registerAccount({
        name: data.account,
      })
      showToast(
        'success',
        t('Panel.Account.FormAccount.accountRegister'),
        5000,
        'bottom-left',
      )
      setOpenAddAccountDialog(false)
      refreshData()
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        showToast('error', t(`Errors.${error.message}`), 5000, 'bottom-left')
      }
    }
  }

  useEffect(() => {
    if (isValid) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(handleFormRegisterAccount)())
    } else {
      setHasUnsavedChanges(false)
    }
  }, [isValid, handleSubmit])

  useEffect(() => {
    if (!hasUnsavedChanges && isSubmitting) {
      setIsSaveChangesDialogOpen(false)
    }
  }, [hasUnsavedChanges, isSubmitting])

  return (
    <form
      onSubmit={handleSubmit(handleFormRegisterAccount)}
      className="grid grid-cols-1 pt-xm px-s pb-m justify-center items-center gap-s self-stretch"
    >
      <Textfield
        value={acconutValue}
        placeholder={t('Panel.Account.FormAccount.placeholderAccount')}
        type="text"
        {...register('account')}
        variant={errors.account ? 'error' : undefined}
        validationMessages={
          errors.account?.message ? [{ message: errors.account.message }] : []
        }
      />
      <div className="flex items-center gap-s justify-center pb-s">
        <Button
          preIcon={<FiArrowLeft width={20} height={20} />}
          type="button"
          size="lg"
          variant="text"
          hasShadow={false}
          width={110}
          onClick={(e) => {
            e.preventDefault()
            onClose()
          }}
        >
          {t('Panel.Account.FormAccount.buttonBack')}
        </Button>
        <Button
          type="submit"
          size="lg"
          width={160}
          variant="primary"
          disabled={!isValid || isSubmitting}
        >
          {t('Panel.Account.FormAccount.buttonSave')}
        </Button>
      </div>
    </form>
  )
}

export default FormAccounts
