import Button from '@/components/atoms/Button'
import { useSignupStore } from '@/stores/SignupStore'
import { useTranslations } from 'next-intl'
import { FiAlertOctagon, FiArrowLeft } from 'react-icons/fi'

export const SignupStatusError = () => {
  const t = useTranslations()
  const { resetFormStep, setStatus } = useSignupStore()

  return (
    <div className="flex flex-col items-center text-center mt-xm gap-xm">
      <FiAlertOctagon size={80} className="text-notify-warning-normal" />

      <p className="text-H6 font-Bold text-grey-300">
        {t('Panel.Register.registerForm.statusStep.error.emphasis.boldText')}{' '}
        <span className="text-notify-warning-normal">
          {t(
            'Panel.Register.registerForm.statusStep.error.emphasis.coloredText',
          )}
        </span>
      </p>

      <p className="text-BODY-XM font-Bold text-grey-300">
        {t('Panel.Register.registerForm.statusStep.error.description.boldText')}
        <p className="text-BODY-S font-Regular mt-xs">
          {t(
            'Panel.Register.registerForm.statusStep.error.description.regularText',
          )}
          <strong>
            {' '}
            {t(
              'Panel.Register.registerForm.statusStep.error.description.regularText2',
            )}
          </strong>
        </p>
      </p>

      <Button
        variant="text"
        isBrandButton
        size="lg"
        preIcon={<FiArrowLeft width={20} height={20} />}
        onClick={() => {
          resetFormStep()
          setStatus(null)
        }}
      >
        {t('Panel.Register.registerForm.statusStep.error.submitButtonText')}
      </Button>
    </div>
  )
}
