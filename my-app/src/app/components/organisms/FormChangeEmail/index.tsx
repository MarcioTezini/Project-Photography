import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import Textfield from '@/components/atoms/Textfield'
import { changeEmail, getUserData } from '@/services/user/user'
import { useTranslations } from 'next-intl'
import { homeLogout } from '@/services/auth/login'
import { showToast } from '@/components/atoms/Toast'
import useChangeEmailDialogStoreDialogStore from '@/stores/DialogChangeEmail'

function FormChangeEmail() {
  const t = useTranslations()
  const [currentEmail, setCurrentEmail] = useState('')
  const [code, setCode] = useState(Array(6).fill(''))
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const { setOpenChangeEmaillDialog, step, setStep } =
    useChangeEmailDialogStoreDialogStore()

  const schema = z
    .object({
      email: z
        .string()
        .email({ message: t('Errors.invalidEmail') })
        .optional(),
      verifyCode: z
        .array(z.string().length(1, t('Home.DialogChangeEmail.HaveOneDigit')))
        .length(6, t('Home.DialogChangeEmail.InvalidCode'))
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (step === 1) {
        if (!data.email) {
          ctx.addIssue({
            code: 'custom',
            path: ['email'],
          })
        }
      } else if (step === 2) {
        if (!data.verifyCode || data.verifyCode.length !== 6) {
          ctx.addIssue({
            code: 'custom',
            path: ['verifyCode'],
          })
        }
      }
    })

  const fetchMeData = async () => {
    try {
      const me = await getUserData()
      if (me) {
        setCurrentEmail(me?.data?.user?.email)
      }
    } catch (error) {
      console.error('Error fetching me data:', error)
    }
  }

  useEffect(() => {
    fetchMeData()
  }, [])

  type FormLoginSchema = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
    trigger,
    setError,
  } = useForm<FormLoginSchema>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const emailValue = watch('email') || ''

  const handleCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value.slice(-1)
    if (!/^[0-9]$/.test(value) && value !== '') return

    const updatedCode = [...code]
    updatedCode[index] = value
    setCode(updatedCode)
    setValue(`verifyCode.${index}`, value)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    } else if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedData = e.clipboardData.getData('Text').slice(0, 6).split('')
    const updatedCode = [...code]
    pastedData.forEach((char: string, i: number) => {
      if (i < 6) updatedCode[i] = char
      setValue(`verifyCode.${i}`, char)
    })
    setCode(updatedCode)
  }

  const handleNextStep = () => {
    setStep(step === 1 ? 2 : step)
  }

  const isCodeComplete = () => {
    return code.every((digit) => digit !== '')
  }

  useEffect(() => {
    if (isCodeComplete()) {
      trigger()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, trigger])

  const onSubmitEmail = async () => {
    try {
      const verifyCodeString = code.join('')
      await changeEmail(emailValue, verifyCodeString)

      if (step === 2) {
        showToast(
          'success',
          t('Home.DialogChangeEmail.ChangedSuccessfully'),
          5000,
          'bottom-left',
        )
        homeLogout()
      }

      handleNextStep()
    } catch (error) {
      console.error('Error changing email:', error)

      if (step === 2) {
        // Define a mensagem de erro diretamente no campo `verifyCode`
        setError('verifyCode', {
          type: 'manual',
          message: t('Home.DialogChangeEmail.InvalidCode'),
        })
      }
    }
  }

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div>
          <div className="text-center mb-4">
            <div>
              <p className="text-fichasPay-main-400 text-BODY-XM font-Bold">
                {t('Home.DialogChangeEmail.CurrentEmail')}:
              </p>
              <p className="text-grey-300 text-BODY-XM font-Regular mb-xm">
                {currentEmail}
              </p>
              <p className="text-grey-300 text-BODY-XM font-Regular">
                {t('Home.DialogChangeEmail.NewEmail')}
              </p>
            </div>
          </div>
          <div className="my-xm">
            <Textfield
              value={emailValue}
              placeholder="Digite seu email"
              isDarkMode
              type="text"
              {...register('email')}
              variant={errors.email ? 'error' : undefined}
              validationMessages={
                errors.email?.message
                  ? [{ message: String(errors.email.message) }]
                  : []
              }
            />
          </div>
          <div className="mb-xm text-center">
            <p className="text-grey-300 text-BODY-XM font-Regular">
              <span className="font-Bold">
                {t('Home.DialogChangeEmail.Remember')},
              </span>{' '}
              {t('Home.DialogChangeEmail.ThePixKey')}{' '}
            </p>
            <p className="text-fichasPay-main-400 text-BODY-XM font-Bold">
              {t('Home.DialogChangeEmail.UpToDate')}
            </p>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div className="text-center mb-4">
            <p className="text-grey-300 text-BODY-XM font-Regular pb-s">
              {t('Home.DialogChangeEmail.EnterTheCode')}
            </p>
          </div>
          <div className="flex gap-xs justify-center" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <Controller
                key={index}
                name={`verifyCode.${index}` as const}
                control={control}
                render={({ field }) => (
                  <div className="w-[48px] h-[55px] text-center border rounded">
                    <Textfield
                      {...field}
                      id={`code-input-${index}`}
                      type="text"
                      maxLength={1}
                      inputClassname="text-center"
                      value={digit}
                      isDarkMode
                      onChange={(e) => handleCodeChange(e, index)}
                      onFocus={(e) => e.target.select()}
                      variant={errors.verifyCode ? 'error' : undefined}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                    />
                  </div>
                )}
              />
            ))}
          </div>
          {errors.verifyCode && (
            <p className="flex items-center gap-xxs text-grey-300 text-[10px] text-left mt-xxs">
              <FiAlertCircle className="text-notify-warning-normal" />
              {typeof errors.verifyCode?.message === 'string'
                ? errors.verifyCode.message
                : ''}
            </p>
          )}
        </div>
      )
    }
  }

  return (
    <div className="m-auto py-xm w-[328px]">
      <form onSubmit={handleSubmit(onSubmitEmail)}>
        {renderStepContent()}
        <div className="flex items-center gap-s justify-center pb-s mt-xm">
          <Button
            type="button"
            preIcon={<FiArrowLeft width={20} height={20} />}
            size="lg"
            isBrandButton
            variant="text"
            width={110}
            onClick={() => {
              if (step === 1) {
                setOpenChangeEmaillDialog(false)
              } else {
                setStep(1)
              }
            }}
          >
            {t('Home.DialogChangeEmail.ButtonBack')}
          </Button>
          <Button
            type="submit"
            size="lg"
            width={110}
            isBrandButton
            variant="primary"
            disabled={
              !isValid || isSubmitting || (step === 2 && !isCodeComplete())
            }
          >
            {t('Home.DialogChangeEmail.ChangeEmail')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FormChangeEmail
