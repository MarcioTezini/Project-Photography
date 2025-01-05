import { useTranslations } from 'next-intl'
import { FiArrowRight, FiCheckSquare } from 'react-icons/fi'
import { useSignupStore } from '@/stores/SignupStore'
import Button from '@/components/atoms/Button'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'

export const NotCreatedInApp = () => {
  const t = useTranslations()
  const { resetFormStep, onCloseForm } = useSignupStore()
  const { setOpenHomeLoginDialog } = useHomeLoginDialogStore()

  return (
    <div className="flex flex-col items-center text-center mt-xm gap-xm">
      <FiCheckSquare size={80} className="text-notify-success-normal" />

      <p className="text-H6 font-Bold text-grey-300">
        {t('Panel.Register.registerForm.statusStep.notCreatedInApp.title')}{' '}
        <span className="text-notify-success-normal">
          {t(
            'Panel.Register.registerForm.statusStep.notCreatedInApp.titleSuccess',
          )}
        </span>
      </p>

      <p className="text-BODY-XM font-Bold text-grey-300">
        {t(
          'Panel.Register.registerForm.statusStep.notCreatedInApp.description.boldText',
        )}
      </p>
      <div className="flex flex-col gap-s">
        <Button
          variant="primary"
          isBrandButton
          size="lg"
          addIcon={<FiArrowRight size={20} />}
          onClick={() => {
            onCloseForm()
            resetFormStep()
            setOpenHomeLoginDialog(true)
          }}
        >
          {t(
            'Panel.Register.registerForm.statusStep.notCreatedInApp.button.primary',
          )}
        </Button>
      </div>
    </div>
  )
}
