import React, { useEffect, useState } from 'react'
import Button from '@/components/atoms/Button'
import Textfield from '@/components/atoms/Textfield'
import { showToast } from '@/components/atoms/Toast'
import { resetPasswordHome } from '@/services/user/password'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCheckSquare,
  FiSlash,
} from 'react-icons/fi'
import { z } from 'zod'
import { useLoginStore } from '@/stores/LoginStore'

const validatePasswordRules = (password: string, currentPassword: string) => {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    notEqualToCurrent: password !== currentPassword,
  }
}

export const FormResetPasswordHome = () => {
  const t = useTranslations()

  const formNewPasswordHomeSchema = z
    .object({
      currentPassword: z.string(),
      newPassword1: z
        .string()
        .min(1, t('Errors.passwordRequired'))
        .regex(/[A-Z]/, '')
        .regex(/\d/, ''),
      newPassword2: z
        .string()
        .min(1, t('Errors.passwordConfirmRequired'))
        .regex(/[A-Z]/, '')
        .regex(/\d/, ''),
    })
    .refine((data) => data.newPassword1 !== data.currentPassword, {
      message: t('Errors.passwordDifFromCurrent'),
      path: ['newPassword2'],
    })
    .refine((data) => data.newPassword1 === data.newPassword2, {
      message: t('Errors.passwordsDoNotMatch'),
      path: ['newPassword2'],
    })
    .refine((data) => data.newPassword2 === data.newPassword1, {
      message: t('Errors.passwordsDoNotMatch'),
      path: ['newPassword2'],
    })

  type FormNewPasswordHomeSchema = z.infer<typeof formNewPasswordHomeSchema>

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
    clearErrors,
    reset,
    setError,
    setValue,
  } = useForm<FormNewPasswordHomeSchema>({
    resolver: zodResolver(formNewPasswordHomeSchema),
    mode: 'onChange',
  })

  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    notEqualToCurrent: false,
  })
  const [showPasswordRules, setShowPasswordRules] = useState(false)

  const currentPasswordValue = watch('currentPassword')
  const newPasswordValue1 = watch('newPassword1')
  const newPasswordValue2 = watch('newPassword2')
  const { onClose } = useLoginStore()

  const removeEmojis = (str: string) => {
    return str.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
  }

  const handleNewPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const inputName = event.target.name as
      | 'currentPassword'
      | 'newPassword1'
      | 'newPassword2'
    const cleanValue = removeEmojis(event.target.value)
    setValue(inputName, cleanValue, { shouldValidate: true })
    if (inputName === 'newPassword1') {
      setPasswordRules(
        validatePasswordRules(cleanValue, currentPasswordValue || ''),
      )
    }
  }

  const getIcon = (rule: boolean) => {
    if (rule) {
      return <FiCheckSquare color="green" />
    }
    return newPasswordValue1 ? (
      <FiSlash color="red" />
    ) : (
      <FiAlertTriangle color="orange" />
    )
  }

  const onSubmit = async (data: FormNewPasswordHomeSchema) => {
    try {
      const response = await resetPasswordHome({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword1,
      })
      if (response) {
        showToast(
          'success',
          t('Panel.Password.passwordForm.passwordChangedHome'),
          5000,
          'bottom-left',
        )
        reset()
        onClose()
        setPasswordRules({
          minLength: false,
          hasUpperCase: false,
          hasNumber: false,
          notEqualToCurrent: false,
        })
      } else {
        setError('currentPassword', {
          type: 'manual',
          message: t('Errors.incorretPassword'),
        })
      }
    } catch (error) {
      if (error instanceof Error) {
        setError('currentPassword', {
          type: 'manual',
          message: t('Errors.incorretPassword'),
        })
      } else {
        showToast('error', t('Errors.passwordChangeError'), 5000, 'bottom-left')
      }
    }
  }

  useEffect(() => {
    if (isValid) {
      clearErrors()
    }
  }, [isValid, clearErrors])

  return (
    <form
      className="w-[328px] sm:w-full m-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex p-s sm:px-xs flex-col justify-end items-center sm:items-center self-stretch">
        <div className="flex items-center gap-xs self-stretch">
          <h6 className="text-grey-900 font-Regular text-H6">
            {t('Panel.Password.titleCard')}
          </h6>
        </div>
        <div className="flex items-center self-stretch sm:grid sm:grid-cols-1">
          <div className="w-full">
            <div className="order-1 h-[72px] sm:order-1">
              <Textfield
                isDarkMode
                value={currentPasswordValue}
                placeholder={t(
                  'Panel.Password.passwordForm.currentPasswordPlaceholder',
                )}
                type="password"
                {...register('currentPassword', {
                  onChange: handleNewPasswordChange,
                  onBlur: () => setShowPasswordRules(true),
                })}
                variant={errors.currentPassword && 'error'}
                validationMessages={
                  errors.currentPassword?.message
                    ? [{ message: errors.currentPassword.message }]
                    : []
                }
              />
            </div>
            <div className="order-3 sm:order-2">
              <Textfield
                isDarkMode
                value={newPasswordValue1}
                placeholder={t(
                  'Panel.Password.passwordForm.newPasswordPlaceholder',
                )}
                type="password"
                {...register('newPassword1', {
                  onChange: handleNewPasswordChange,
                })}
                onFocus={() => setShowPasswordRules(true)}
                variant={errors.newPassword2 && 'error'}
                validationMessages={[]}
              />
            </div>
            {showPasswordRules && (
              <div className="order-4 sm:order-4 mt-xs">
                <div className="flex flex-col items-start gap-xxs">
                  <p className="text-grey-300 text-LABEL-M font-Semibold">
                    {t('Panel.Password.passwordForm.passwordMustContain')}
                  </p>
                  <p className="flex gap-xxs items-center text-LABEL-L font-Regular text-grey-300">
                    {getIcon(passwordRules.minLength)}
                    {t('Panel.Password.passwordForm.passwordMinLength')}
                  </p>
                  <p className="flex gap-xxs items-center text-LABEL-L font-Regular text-grey-300">
                    {getIcon(passwordRules.hasUpperCase)}
                    {t('Panel.Password.passwordForm.passwordUpperCase')}
                  </p>
                  <p className="flex gap-xxs items-center text-LABEL-L font-Regular text-grey-300">
                    {getIcon(passwordRules.hasNumber)}
                    {t('Panel.Password.passwordForm.passwordNumber')}
                  </p>
                </div>
              </div>
            )}
            <div className="order-2 h-[72px] sm:order-3 mt-s">
              <Textfield
                isDarkMode
                value={newPasswordValue2}
                placeholder={t(
                  'Panel.Password.passwordForm.confirmPasswordPlaceholder',
                )}
                type="password"
                {...register('newPassword2', {
                  onChange: handleNewPasswordChange,
                })}
                variant={errors.newPassword2 && 'error'}
                validationMessages={
                  errors.newPassword2?.message
                    ? [{ message: errors.newPassword2.message }]
                    : []
                }
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-s justify-center mb-xl mt-xm">
          <Button
            preIcon={<FiArrowLeft width={20} height={20} />}
            type="button"
            size="lg"
            variant="text"
            hasShadow={false}
            width={110}
            isBrandButton
            onClick={(e) => {
              e.preventDefault()
              onClose()
            }}
          >
            {t('Panel.Whitelist.FormWhitelist.buttonBack')}
          </Button>
          <Button
            type="submit"
            size="lg"
            isBrandButton
            disabled={!isValid || isSubmitting}
          >
            {t('Panel.login.forgotPassword.changePasswordButtonText')}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default FormResetPasswordHome
