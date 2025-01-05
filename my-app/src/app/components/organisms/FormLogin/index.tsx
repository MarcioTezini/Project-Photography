'use client'

import Button from '@/components/atoms/Button'
import Checkbox from '@/components/atoms/Checkbox'
import Textfield from '@/components/atoms/Textfield'
import { showToast } from '@/components/atoms/Toast'
import { login, MenuItem } from '@/services/auth/login'
import { useLoginStore } from '@/stores/LoginStore'
import { useMe } from '@/stores/Me'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export function FormLogin() {
  const t = useTranslations()
  const { setMe, setPermissions } = useMe()
  const router = useRouter()
  const locale = useLocale()

  const { setIsResettingPassword } = useLoginStore()

  const formLoginSchema = z.object({
    email: z
      .string()
      .min(1, t('Errors.emailRequired'))
      .email(t('Errors.invalidEmail')),
    password: z.string().min(1, t('Errors.passwordRequired')),
    keepLoggedIn: z.boolean().optional(),
  })

  type FormLoginSchema = z.infer<typeof formLoginSchema>

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormLoginSchema>({
    resolver: zodResolver(formLoginSchema),
    mode: 'onChange',
  })

  const emailValue = watch('email')
  const passwordValue = watch('password')
  const keepLoggedInValue = watch('keepLoggedIn')

  const extractUrls = (menu: MenuItem[]): string[] => {
    const urls: string[] = []

    const extractFromItems = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.url) urls.push(item.url)
        if (item.dropdownItems && item.dropdownItems.length > 0) {
          extractFromItems(item.dropdownItems)
        }
      })
    }

    extractFromItems(menu)
    return urls
  }

  async function handleFormLogin(data: FormLoginSchema) {
    try {
      const userData = await login({
        email: data.email,
        password: data.password,
        keepLoggedIn: data?.keepLoggedIn,
      })

      setMe(userData)

      const urls = extractUrls(userData.menu)
      setPermissions(urls)

      router.push(`/${locale}/painel`)
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

  return (
    <form
      onSubmit={handleSubmit(handleFormLogin)}
      className="grid grid-cols-1 pt-xm px-s pb-m justify-center items-center gap-s self-stretch"
    >
      <Textfield
        value={emailValue}
        placeholder={t('Panel.login.loginForm.emailPlaceholder')}
        type="email"
        {...register('email')}
        variant={errors.email && 'error'}
        validationMessages={
          errors.email?.message ? [{ message: errors.email.message }] : []
        }
      />
      <Textfield
        value={passwordValue}
        placeholder={t('Panel.login.loginForm.passwordPlaceholder')}
        type="password"
        {...register('password')}
        variant={errors.password && 'error'}
        validationMessages={
          errors.password?.message ? [{ message: errors.password.message }] : []
        }
      />
      <div className="flex w-full pt-s pb-xs gap-xs items-center">
        <Checkbox {...register('keepLoggedIn')} checked={keepLoggedInValue} />
        <label className="text-grey-900 text-BODY-XM font-Medium">
          {t('Panel.login.loginForm.keepLoggedInLabel')}
        </label>
      </div>
      <div className="flex px-m flex-col justify-center items-center gap-m self-stretch">
        <Button
          type="submit"
          size="lg"
          width={160}
          disabled={!isValid || isSubmitting}
        >
          {t('Panel.login.loginForm.submitButtonText')}
        </Button>
        <label
          className="text-center text-BODY-XM font-Medium text-grey-900 hover:cursor-pointer"
          onClick={setIsResettingPassword}
        >
          {t('Panel.login.loginForm.forgotPasswordText')}
        </label>
      </div>
    </form>
  )
}
