import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Textfield from '@/components/atoms/Textfield'
import { Tooltip } from '@/components/atoms/Tooltip'
import { zodResolver } from '@hookform/resolvers/zod'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useForm } from 'react-hook-form'
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiCheckSquare,
} from 'react-icons/fi'
import { z } from 'zod'
import { useSignupStore } from '@/stores/SignupStore'
import Button from '@/components/atoms/Button'
import { SendEmailAndPassword } from '@/services/user/homeRegister'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'

const validatePasswordRules = (password: string, currentPassword: string) => {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    notEqualToCurrent: password !== currentPassword,
  }
}

export const AuthStep = ({ onCloseForm }: { onCloseForm: () => void }) => {
  const t = useTranslations()
  const { nextStep, setHash, resetFormStep } = useSignupStore()
  const { customerData } = useCustomerStore()
  const { setOpenHomeLoginDialog } = useHomeLoginDialogStore()

  const requiredPassword = t(
    'Panel.Register.registerForm.authStep.errors.passwordRequired',
  )
  const passwordUpperCase = t('Panel.Password.passwordForm.passwordUpperCase')
  const passwordNumber = t('Panel.Password.passwordForm.passwordNumber')

  const formLoginSchema = z.object({
    email: z
      .string()
      .min(1, t('Panel.Register.registerForm.authStep.errors.emailRequired'))
      .email(t('Errors.invalidEmail')),
    password: z
      .string()
      .min(8, requiredPassword)
      .regex(/[A-Z]/, passwordUpperCase)
      .regex(/\d/, passwordNumber),
  })

  type FormLoginSchema = z.infer<typeof formLoginSchema>

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormLoginSchema>({
    resolver: zodResolver(formLoginSchema),
    mode: 'onChange',
  })

  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    notEqualToCurrent: false,
  })
  const [emailExistsError, setEmailExistsError] = useState(false)

  const emailValue = watch('email')
  const passwordValue = watch('password')

  const removeEmojis = (str: string) => {
    return str.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
  }

  const handleNewPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const inputName = event.target.name as 'password'
    const cleanValue = removeEmojis(event.target.value)
    setValue(inputName, cleanValue, { shouldValidate: true })
    if (inputName === 'password') {
      setPasswordRules(validatePasswordRules(cleanValue, passwordValue || ''))
    }
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputName = event.target.name as 'email'
    const cleanValue = removeEmojis(event.target.value)
    setValue(inputName, cleanValue, { shouldValidate: true })

    // Limpa o erro de emailExistsError ao digitar no campo email
    if (emailExistsError) setEmailExistsError(false)
  }

  const getIcon = (rule: boolean) => {
    if (rule) {
      return <FiCheckSquare className="text-notify-success-dark" />
    } else {
      return <FiAlertTriangle className="text-notify-alert-dark" />
    }
  }

  const handleSubmitAuthStep = async (data: {
    email: string
    password: string
  }) => {
    try {
      const customerId = customerData?.id
      if (customerId) {
        const response = await SendEmailAndPassword({
          step: 1,
          customer: customerId,
          email: data.email,
          password: data.password,
        })

        if (response?.success) {
          setHash(response.data)
          nextStep()
        }
      } else {
        console.error('Failed to submit AuthStep')
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Email exists') {
          setEmailExistsError(true)
        }
      }
      console.error('Error in handleSubmitAuthStep', error)
    }
  }

  return (
    <>
      <form
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
          }
        }}
        onSubmit={handleSubmit(handleSubmitAuthStep)}
        className="flex flex-col gap-xs mt-xm"
      >
        <Textfield
          value={emailValue}
          placeholder={t(
            'Panel.Register.registerForm.authStep.emailPlaceholder',
          )}
          isDarkMode
          type="email"
          {...register('email', {
            onChange: handleEmailChange,
          })}
          variant={errors.email || emailExistsError ? 'error' : undefined}
          validationMessages={
            errors.email?.message ? [{ message: errors.email.message }] : []
          }
          icon={
            <div className="absolute right-[12px] flex">
              <TooltipPrimitive.Provider>
                <Tooltip
                  side="top"
                  className="w-[128px] px-xs"
                  tooltipIconClassname="w-[22px] h-[22px]"
                  content={
                    <>
                      <p className="text-grey-900 text-LABEL-L font-Bold text-center">
                        {t(
                          'Panel.Register.registerForm.authStep.tooltip.email.boldMessage',
                        )}
                      </p>
                      <p className="text-grey-900 text-LABEL-L font-Medium text-center">
                        {t(
                          'Panel.Register.registerForm.authStep.tooltip.email.message',
                        )}
                      </p>
                    </>
                  }
                  defaultOpen={false}
                  contentMarginRight="30px"
                >
                  <FiAlertCircle className="w-6 h-6 text-grey-600 cursor-pointer" />
                </Tooltip>
              </TooltipPrimitive.Provider>
            </div>
          }
        />

        {emailExistsError && (
          <div className="flex pr-xxm pl-xs items-start gap-xxs -mt-xxxs">
            <FiAlertCircle size={12} className="text-notify-warning-normal" />
            <p className="text-notify-warning-normal text-LABEL-L font-Medium">
              {t('Panel.Register.registerForm.authStep.errors.emailExists1')}{' '}
              <span
                onClick={() => {
                  onCloseForm()
                  setOpenHomeLoginDialog(true)
                }}
                className="text-fichasPay-main-400 text-LABEL-L font-Medium hover:cursor-pointer"
              >
                {t('Panel.Register.registerForm.authStep.errors.emailExists2')}
              </span>
            </p>
          </div>
        )}

        <Textfield
          value={passwordValue}
          placeholder={t(
            'Panel.Register.registerForm.authStep.passwordPlaceholder',
          )}
          isDarkMode
          type="password"
          {...register('password', {
            onChange: handleNewPasswordChange,
          })}
          variant={errors.password && 'error'}
          validationMessages={
            errors.password?.message
              ? [{ message: errors.password.message }]
              : []
          }
        />
        {(passwordValue || errors.password) && (
          <div>
            <div className="flex flex-col items-start gap-xxs">
              <p className="text-grey-300 text-LABEL-M font-Semibold">
                {t('Panel.Password.passwordForm.passwordMustContain')}
              </p>
              <p className="flex gap-xxs items-center text-LABEL-L font-Medium text-grey-300">
                {getIcon(passwordRules.minLength)}
                {t('Panel.Password.passwordForm.passwordMinLength')}
              </p>
              <p className="flex gap-xxs items-center text-LABEL-L font-Medium text-grey-300">
                {getIcon(passwordRules.hasUpperCase)}
                {t('Panel.Password.passwordForm.passwordUpperCase')}
              </p>
              <p className="flex gap-xxs items-center text-LABEL-L font-Medium text-grey-300">
                {getIcon(passwordRules.hasNumber)}
                {t('Panel.Password.passwordForm.passwordNumber')}
              </p>
            </div>
          </div>
        )}

        <div className="mt-xs mb-xm">
          <div className="flex items-center justify-center gap-s">
            <div className="flex items-center gap-s justify-center mt-m">
              <Button
                variant="outline"
                isBrandButton
                size="lg"
                preIcon={<FiArrowLeft width={20} height={20} />}
                onClick={() => onCloseForm()}
              >
                {t('Panel.Register.registerForm.authStep.backButtonText')}
              </Button>
              <Button
                size="lg"
                isBrandButton
                type="submit"
                disabled={isSubmitting || emailExistsError}
              >
                {t('Panel.Register.registerForm.authStep.submitButtonText')}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center text-BODY-XM gap-xs">
          <span className="font-Regular text-grey-300">
            {t('Panel.Register.registerForm.hasAccountText')}
          </span>
          <span
            className="font-Bold text-pay-main-400 cursor-pointer text-fichasPay-main-400"
            onClick={() => {
              onCloseForm()
              resetFormStep()
              setOpenHomeLoginDialog(true)
            }}
          >
            {t('Panel.Register.registerForm.hasAccountButtonText')}
          </span>
        </div>
      </form>
    </>
  )
}
