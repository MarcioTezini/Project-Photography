import { useTranslations } from 'next-intl'
import { FiArrowRight, FiCheckSquare } from 'react-icons/fi'
import { useSignupStore } from '@/stores/SignupStore'
import Button from '@/components/atoms/Button'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'

export const SignupNotLinkedSuccess = () => {
  const t = useTranslations()
  const { resetFormStep, onCloseForm } = useSignupStore()
  const { setOpenHomeLoginDialog } = useHomeLoginDialogStore()

  return (
    <div className="flex flex-col items-center text-center mt-xm gap-xm">
      <FiCheckSquare size={80} className="text-notify-success-normal" />

      <p className="text-H6 font-Bold text-grey-300">
        {t('Panel.Register.registerForm.statusStep.createdButNotLinked.title')}{' '}
        <span className="text-notify-success-normal">
          {t(
            'Panel.Register.registerForm.statusStep.createdButNotLinked.titleSuccess',
          )}
        </span>
      </p>

      <p className="text-BODY-XM font-Bold text-grey-300">
        {t(
          'Panel.Register.registerForm.statusStep.createdButNotLinked.description.boldText',
        )}
        <p className="text-BODY-S font-Regular mt-s text-grey-300">
          {t(
            'Panel.Register.registerForm.statusStep.createdButNotLinked.description.regularText',
          )}
        </p>
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
            'Panel.Register.registerForm.statusStep.createdButNotLinked.button.primary',
          )}
        </Button>
      </div>
    </div>
  )
}
