'use client'

import Button from '@/components/atoms/Button'
import Textfield from '@/components/atoms/Textfield'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ToastType } from '@/components/atoms/Toast'
import { useTranslations } from 'next-intl'
import { useLoginStore } from '@/stores/LoginStore'
import { useState } from 'react'
import PinInput from '@/components/molecules/PinInput'
import { FiAlertCircle, FiCheckSquare } from 'react-icons/fi'
import {
  changePassword,
  confirmPasswordPinCode,
  sendPasswordPinCode,
} from '@/services/user/password'
import { ToastPosition } from 'react-toastify'

interface FormForgotPasswordProps {
  showToast: (
    type: ToastType,
    message: string,
    autoClose?: number,
    position?: ToastPosition,
  ) => void
}

export function FormForgotPassword({ showToast }: FormForgotPasswordProps) {
  const t = useTranslations()
  const { formStep, nextStep } = useLoginStore()
  const [pin, setPin] = useState<string>('')
  const [hashCode, setHashCode] = useState<string>('')

  const formForgotPasswordSchema = z.object({
    email: z
      .string()
      .min(1, t('Errors.emailRequired'))
      .email(t('Errors.invalidEmail'))
      .regex(/^[^\s@]+@[^\s@]+\.[a-zA-Z0-9]{3,}$/, t('Errors.invalidEmail')),
  })

  const formPinSchema = z.object({
    pin: z
      .string()
      .min(6, t('Errors.pinInvalid'))
      .max(6, t('Errors.pinInvalid')),
  })

  const formNewPasswordSchema = z
    .object({
      password: z
        .string()
        .min(8, t('Errors.passwordMinLength'))
        .regex(/[A-Z]/, t('Errors.passwordUpperCase'))
        .regex(/[0-9]/, t('Errors.passwordNumber'))
        .refine((val) => !/[\u{1F600}-\u{1F64F}]/u.test(val), {
          message: t('Errors.noEmojisAllowed'),
        }),
      confirmPassword: z
        .string()
        .refine((val) => !/[\u{1F600}-\u{1F64F}]/u.test(val), {
          message: t('Errors.noEmojisAllowed'),
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('Errors.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    })

  type FormForgotPasswordSchema = z.infer<typeof formForgotPasswordSchema>
  type FormPinSchema = z.infer<typeof formPinSchema>
  type FormNewPasswordSchema = z.infer<typeof formNewPasswordSchema>

  const {
    register,
    handleSubmit,
    watch,

    formState: { errors, isValid, isSubmitting },
  } = useForm<FormForgotPasswordSchema>({
    resolver: zodResolver(formForgotPasswordSchema),
    mode: 'onChange',
  })

  const {
    handleSubmit: handleSubmitPin,
    setValue: setValuePin,
    setError,
    formState: {
      errors: pinErrors,
      isValid: isValidPin,
      isSubmitting: isSubmittingPin,
    },
  } = useForm<FormPinSchema>({
    resolver: zodResolver(formPinSchema),
    mode: 'onChange',
  })

  const {
    register: registerNewPassword,
    handleSubmit: handleSubmitNewPassword,
    watch: watchNewPassword,
    formState: {
      errors: newPasswordErrors,
      isValid: isValidNewPassword,
      isSubmitting: isSubmittingNewPassword,
    },
  } = useForm<FormNewPasswordSchema>({
    resolver: zodResolver(formNewPasswordSchema),
    mode: 'onChange',
  })

  const emailValue = watch('email')
  const newPasswordValue = watchNewPassword('password')
  const confirmPasswordValue = watchNewPassword('confirmPassword')

  const passwordValidationMessages = [
    {
      message: t('Errors.passwordMinLength'),
      isValid: newPasswordValue?.length >= 8 || false,
    },
    {
      message: t('Errors.passwordUpperCase'),
      isValid: /[A-Z]/.test(newPasswordValue) || false,
    },
    {
      message: t('Errors.passwordNumber'),
      isValid: /[0-9]/.test(newPasswordValue) || false,
    },
  ]

  async function handleFormForgotPassword(data: FormForgotPasswordSchema) {
    try {
      await sendPasswordPinCode({
        step: 0,
        email: data.email,
      })
      nextStep()
    } catch (error) {
      console.error(error)
      nextStep()
    }
  }

  async function handlePinForm(data: FormPinSchema) {
    try {
      const hash = await confirmPasswordPinCode({
        step: 1,
        email: emailValue,
        code: data.pin,
      })
      setHashCode(hash)
      nextStep()
    } catch (error) {
      if (error instanceof Error) {
        setError('pin', {
          type: 'manual',
          message: `${t(`Errors.${error.message}`)}`,
        })
      } else {
        setError('pin', { type: 'manual', message: t('Errors.pinInvalid') })
      }
    }
  }

  async function handleNewPasswordForm(data: FormNewPasswordSchema) {
    try {
      if (!hashCode) {
        throw new Error('Hash code is missing')
      }

      if (emailValue === '') {
        throw new Error('Email is missing')
      }

      await changePassword({
        step: 2,
        email: emailValue,
        hash: hashCode,
        password: data.password,
      })
      nextStep()
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          'error',
          `${t(`Errors.${error.message}`)}`,
          5000,
          'bottom-left',
        )
      } else {
        showToast('error', t('Errors.loginFailed'), 5000, 'bottom-left')
      }
    }
  }

  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="pb-xm sm:pb-l">
            <div className="text-grey-900 text-BODY-XM font-Regular pt-s px-s">
              {t('Panel.login.forgotPassword.description')}
            </div>
            <form
              onSubmit={handleSubmit(handleFormForgotPassword)}
              className="grid grid-cols-1 pt-xm px-s justify-center items-center gap-s self-stretch"
            >
              <Textfield
                value={emailValue}
                placeholder={t('Panel.login.loginForm.emailPlaceholder')}
                type="email"
                {...register('email')}
                variant={errors.email && 'error'}
                validationMessages={
                  errors.email?.message
                    ? [{ message: errors.email.message }]
                    : []
                }
              />
              <div className="flex px-m flex-col justify-center items-center gap-m self-stretch mt-m">
                <Button
                  type="submit"
                  size="lg"
                  width={160}
                  disabled={!isValid || isSubmitting}
                >
                  {t('Panel.login.forgotPassword.submitButtonText')}
                </Button>
              </div>
            </form>
          </div>
        )
      case 2:
        return (
          <div className="pb-xm sm:pb-l">
            <div className="text-grey-900 text-BODY-XM font-Regular pt-s px-s text-center">
              {t('Panel.login.forgotPassword.pinDescription')}
            </div>
            <form
              onSubmit={handleSubmitPin(handlePinForm)}
              className="grid grid-cols-1 pt-xm px-s sm:flex sm:flex-col justify-center items-center gap-xs self-stretch"
            >
              <PinInput
                value={pin}
                onChange={(value) => {
                  setPin(value)
                  setValuePin('pin', value, {
                    shouldValidate: true,
                  })
                }}
                hasError={pinErrors.pin && pin.length === 6 ? true : undefined}
              />
              {pinErrors.pin && pin.length === 6 && (
                <div className="flex items-center gap-xxs sm:self-start [@media_(min-width:_460px)_and_(max-width:_679px)]:ml-m">
                  <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-normal" />
                  <span className="text-LABEL-L font-Regular text-grey-900">
                    {pinErrors.pin.message}
                  </span>
                </div>
              )}
              <div className="flex px-m flex-col justify-center items-center gap-m self-stretch mt-m">
                <Button
                  type="submit"
                  size="lg"
                  width={160}
                  disabled={!isValidPin || isSubmittingPin}
                >
                  {t('Panel.login.forgotPassword.submitButtonText')}
                </Button>
              </div>
            </form>
          </div>
        )
      case 3:
        return (
          <div className="pb-xm sm:pb-l">
            <div className="text-grey-900 text-BODY-XM font-Regular pt-s px-s text-center">
              {t('Panel.login.forgotPassword.newPasswordDescription')}
            </div>
            <form
              onSubmit={handleSubmitNewPassword(handleNewPasswordForm)}
              className="grid grid-cols-1 pt-xm px-s justify-center items-center gap-s self-stretch"
            >
              <div className="flex flex-col gap-[5px]">
                <label className="text-BODY-XM font-Regular text-grey-900">
                  {t('Panel.login.forgotPassword.newPasswordLabel')}
                </label>
                <Textfield
                  value={newPasswordValue}
                  placeholder={t('Panel.login.loginForm.passwordPlaceholder')}
                  type="password"
                  {...registerNewPassword('password')}
                  variant={newPasswordErrors.password && 'error'}
                  validationMessages={
                    newPasswordErrors.password && passwordValidationMessages
                  }
                />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-BODY-XM font-Regular text-grey-900">
                  {t('Panel.login.forgotPassword.confirmPasswordLabel')}
                </label>
                <Textfield
                  value={confirmPasswordValue}
                  placeholder={t('Panel.login.loginForm.passwordPlaceholder')}
                  type="password"
                  {...registerNewPassword('confirmPassword')}
                  variant={
                    newPasswordValue &&
                    confirmPasswordValue &&
                    newPasswordValue !== confirmPasswordValue &&
                    newPasswordErrors.confirmPassword
                      ? 'error'
                      : undefined
                  }
                  validationMessages={
                    newPasswordValue &&
                    confirmPasswordValue &&
                    newPasswordValue !== confirmPasswordValue &&
                    newPasswordErrors.confirmPassword?.message
                      ? [{ message: newPasswordErrors.confirmPassword.message }]
                      : []
                  }
                />
              </div>
              <div className="flex px-m flex-col justify-center items-center gap-m self-stretch mt-m">
                <Button
                  type="submit"
                  size="lg"
                  width={160}
                  disabled={!isValidNewPassword || isSubmittingNewPassword}
                >
                  {t('Panel.login.forgotPassword.changePasswordButtonText')}
                </Button>
              </div>
            </form>
          </div>
        )
      case 4:
        return (
          <div className="flex flex-col items-center justify-center gap-s mb-xm mt-s py-xxxm">
            <FiCheckSquare className="w-[60px] h-[60px] text-notify-success-normal" />
            <p className="text-BODY-XM font-Regular text-grey-900">
              {t('Panel.login.forgotPassword.passwordChanged')}
            </p>
          </div>
        )
    }
  }

  return renderFormStep()
}
