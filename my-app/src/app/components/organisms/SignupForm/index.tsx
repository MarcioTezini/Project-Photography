import Dialog from '@/components/molecules/Dialog'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useSignupStore } from '@/stores/SignupStore'
import { AuthStep } from './Steps/AuthStep'
import { StatusStep } from './Steps/StatusStep'
import { UserStep } from './Steps/UserStep'

export const SignUp: React.FC = () => {
  const t = useTranslations()
  const { formStep, resetFormStep, status, openForm, onCloseForm } =
    useSignupStore()

  return (
    <Dialog
      title={t('Panel.Register.registerForm.title')}
      open={openForm}
      onClose={() => {
        resetFormStep()
        onCloseForm()
      }}
      position="aside"
      isDarkMode
      removeHeaderPaddingX
      className="w-[531px] max-w-none !p-0 sm:h-auto sm:!pb-xl sm:rounded-b-none"
    >
      <div className="w-full max-w-[328px] mx-auto">
        {formStep === 1 && <AuthStep onCloseForm={onCloseForm} />}
        {formStep === 2 && <UserStep />}
        {formStep === 3 && <StatusStep status={status} />}
      </div>
    </Dialog>
  )
}
