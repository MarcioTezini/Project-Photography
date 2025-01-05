import { CheckStatus, ResendEmail } from '@/services/user/homeRegister'
import { useTranslations } from 'next-intl'
import { FiLoader } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useSignupStore } from '@/stores/SignupStore'
import { showToast } from '@/components/atoms/Toast'

export const SignupStatusInfo = () => {
  const t = useTranslations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { hash, onOpenForm, setFormStep, setStatus } = useSignupStore()

  const handleResendEmail = async () => {
    setIsSubmitting(true)
    try {
      const response = await ResendEmail({
        step: 4,
        hash,
      })

      if (response?.success) {
        showToast(
          'success',
          t('Panel.Register.registerForm.statusStep.info.resendEmailSuccess'),
          3000,
          'bottom-left',
        )
      } else {
        showToast(
          'error',
          t('Panel.Register.registerForm.statusStep.info.resendEmailError'),
          3000,
          'bottom-left',
        )
      }
    } catch (error) {
      showToast(
        'error',
        t('Panel.Register.registerForm.statusStep.info.resendEmailError'),
        3000,
        'bottom-left',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Periodically check the registration status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await CheckStatus({
          step: 0, // Use the appropriate step based on your requirements
          hash,
        })

        if (
          response &&
          response.message === 'Register finished, account created and linked'
        ) {
          setFormStep(3)
          setStatus(2) // Conta cadastrada, conta criada na app e vínculo automático
          onOpenForm()
        } else if (
          response &&
          response.message ===
            'Register finished, account created and not linked'
        ) {
          setFormStep(3)
          setStatus(5) // Conta cadastrada, conta criada no app, porém sem vínculo automático
          onOpenForm()
        } else if (
          response &&
          response.message === 'Register finished, no account created or linked'
        ) {
          setFormStep(3)
          setStatus(6) // Conta cadastrada e conta não criada no app (logo também não tem vínculo)
          onOpenForm()
        } else if (
          response &&
          response.message === 'Register finished, linked account'
        ) {
          setFormStep(3)
          setStatus(1) // Conta cadastrada, conta já existente na App e vínculo automático
          onOpenForm()
        } else if (response && response.success === false) {
          setFormStep(3)
          setStatus(4) // Erro no cadastro
          onOpenForm()
        }
      } catch (error) {
        setFormStep(3)
        setStatus(4) // Erro no cadastro
        onOpenForm()
      }
    }, 5000) // 5 seconds interval

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])

  return (
    <div className="flex flex-col items-center text-center mt-xm gap-xm">
      <FiLoader size={80} className="text-notify-info-normal animate-spin" />

      <p className="text-BODY-XM font-Bold text-grey-300">
        {t('Panel.Register.registerForm.statusStep.info.title')}
      </p>

      <p className="text-H6 font-Bold px-s text-grey-300">
        {t('Panel.Register.registerForm.statusStep.info.emphasis.boldText')}{' '}
        <span className="text-notify-info-normal">
          {t(
            'Panel.Register.registerForm.statusStep.info.emphasis.coloredText',
          )}
        </span>
      </p>

      <p className="text-BODY-S font-Regular text-grey-300 px-xs">
        {t(
          'Panel.Register.registerForm.statusStep.info.description.regularText',
        )}
      </p>

      <p className="text-BODY-XM font-Bold text-grey-300 px-s">
        {t('Panel.Register.registerForm.statusStep.info.sendedEmailText')}{' '}
        <button
          onClick={handleResendEmail}
          className="text-fichasPay-main-400"
          disabled={isSubmitting}
        >
          {t(
            'Panel.Register.registerForm.statusStep.info.sendedEmailButtonText',
          )}
        </button>
      </p>
    </div>
  )
}
