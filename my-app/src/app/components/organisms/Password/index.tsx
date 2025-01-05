'use client'

import Card from '@/components/molecules/Cards'
import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { showToast } from '@/components/atoms/Toast'
import Textfield from '@/components/atoms/Textfield'
import Button from '@/components/atoms/Button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { FiAlertTriangle, FiCheckSquare, FiSlash } from 'react-icons/fi'
import { resetPassword } from '@/services/user/password'

// Função para validar as regras de senha
const validatePasswordRules = (password: string, currentPassword: string) => {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    notEqualToCurrent: password !== currentPassword,
  }
}

const Password: React.FC = () => {
  const t = useTranslations()

  const formNewPasswordSchema = z
    .object({
      currentPassword: z.string(),
      newPassword1: z
        .string()
        .min(1, t('Errors.passwordRequired'))
        .regex(/[A-Z]/, '')
        .regex(/\d/, ''),
      newPassword2: z.string().min(1, t('Errors.passwordConfirmRequired')),
    })
    .refine((data) => data.newPassword1 !== data.currentPassword, {
      message: t('Errors.passwordDifFromCurrent'),
      path: ['newPassword1'],
    })
    .refine((data) => data.newPassword1 === data.newPassword2, {
      message: t('Errors.passwordsDoNotMatch'),
      path: ['newPassword2'],
    })
    .refine((data) => data.newPassword2 === data.newPassword1, {
      message: t('Errors.passwordsDoNotMatch'),
      path: ['newPassword2'],
    })

  type FormNewPasswordSchema = z.infer<typeof formNewPasswordSchema>

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
    clearErrors,
    reset,
    setError,
    setValue,
  } = useForm<FormNewPasswordSchema>({
    resolver: zodResolver(formNewPasswordSchema),
    mode: 'onChange',
  })

  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    notEqualToCurrent: false,
  })

  const currentPasswordValue = watch('currentPassword')
  const newPasswordValue1 = watch('newPassword1')
  const newPasswordValue2 = watch('newPassword2')

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

  const onSubmit: SubmitHandler<FormNewPasswordSchema> = async (data) => {
    if (!currentPasswordValue) {
      setError('currentPassword', {
        type: 'manual',
        message: t('Errors.incorretPassword'),
      })
      return
    }

    try {
      const response = await resetPassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword1,
      })

      if (response) {
        showToast(
          'success',
          t('Panel.Password.passwordForm.passwordChanged'),
          5000,
          'bottom-left',
        )
        reset()
        setPasswordRules({
          minLength: false,
          hasUpperCase: false,
          hasNumber: false,
          notEqualToCurrent: false,
        })
      } else {
        showToast('error', t('Errors.passwordChangeError'), 5000, 'bottom-left')
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'painelPasswordIncorrect') {
          setError('currentPassword', {
            type: 'manual',
            message: t('Errors.incorretPassword'),
          })
        } else {
          showToast(
            'error',
            t('Errors.passwordChangeError'),
            5000,
            'bottom-left',
          )
        }
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
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex p-s sm:px-xs sm:py-s flex-col justify-end items-end sm:items-center gap-xm self-stretch">
          <div className="flex items-center gap-xs self-stretch">
            <h6 className="text-grey-900 font-Regular text-H6">
              {t('Panel.Password.titleCard')}
            </h6>
          </div>
          <hr className="w-full text-grey-600" />
          <div className="flex items-center gap-xm self-stretch sm:grid sm:grid-cols-1">
            <div className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-1 sm:px-0 pb-m justify-center gap-xm gap-y-xs">
                <div className="order-1 h-[72px] sm:order-1">
                  <Textfield
                    value={currentPasswordValue}
                    placeholder={t(
                      'Panel.Password.passwordForm.currentPasswordPlaceholder',
                    )}
                    type="password"
                    {...register('currentPassword', {
                      onChange: handleNewPasswordChange,
                    })}
                    variant={errors.currentPassword && 'error'}
                    validationMessages={
                      errors.currentPassword?.message
                        ? [{ message: errors.currentPassword.message }]
                        : []
                    }
                  />
                </div>
                <div className="order-2 h-[72px] sm:order-3">
                  <Textfield
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
                <div className="order-3 h-[72px] mt-[10px] sm:order-2">
                  <Textfield
                    value={newPasswordValue1}
                    placeholder={t(
                      'Panel.Password.passwordForm.newPasswordPlaceholder',
                    )}
                    type="password"
                    {...register('newPassword1', {
                      onChange: handleNewPasswordChange,
                    })}
                    variant={errors.newPassword1 && 'error'}
                    validationMessages={
                      errors.newPassword1?.message
                        ? [{ message: errors.newPassword1.message }]
                        : []
                    }
                  />
                </div>
                <div className="order-4 sm:order-4">
                  <div className="flex flex-col items-start gap-xxs">
                    <p className="color-grey-900 text-LABEL-M font-Semibold">
                      {t('Panel.Password.passwordForm.passwordMustContain')}
                    </p>
                    <p className="flex gap-xxs items-center text-LABEL-L font-Medium text-grey-900">
                      {getIcon(passwordRules.minLength)}
                      {t('Panel.Password.passwordForm.passwordMinLength')}
                    </p>
                    <p className="flex gap-xxs items-center text-LABEL-L font-Medium text-grey-900">
                      {getIcon(passwordRules.hasUpperCase)}
                      {t('Panel.Password.passwordForm.passwordUpperCase')}
                    </p>
                    <p className="flex gap-xxs items-center text-LABEL-L font-Medium text-grey-900">
                      {getIcon(passwordRules.hasNumber)}
                      {t('Panel.Password.passwordForm.passwordNumber')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {t('Panel.Password.passwordForm.submitButtonText')}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default Password
