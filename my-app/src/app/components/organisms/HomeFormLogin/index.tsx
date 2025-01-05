import Button from '@/components/atoms/Button'
import Checkbox from '@/components/atoms/Checkbox'
import Textfield from '@/components/atoms/Textfield'
import { showToast } from '@/components/atoms/Toast'
import { homeLogin } from '@/services/auth/login'
import { getCustomerData } from '@/services/customer/customer'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useHomeStore } from '@/stores/HomeStore'
import { useMe } from '@/stores/Me'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'
import Dialog from '@/components/molecules/Dialog'
import { useSignupStore } from '@/stores/SignupStore'
import { useLoginStore } from '@/stores/LoginStore'
import { useCustomerStore } from '@/stores/useCustomerStore'

export function HomeFormLogin() {
  const { setIsOpenFormHome } = useLoginStore()
  const { open, handleClose } = useHomeLoginDialogStore()
  const t = useTranslations()
  const { setIsLoggedIn } = useHomeStore()
  const { setMe } = useMe()
  const { fetchConfigs } = useCustomerStore()
  const { onOpenForm } = useSignupStore()
  const formLoginSchema = z.object({
    email: z
      .string()
      .min(1, t('Errors.PleasefillintheEmailfield'))
      .email(t('Errors.invalidEmail')),
    password: z.string().min(1, t('Errors.Pleasefillinthepasswordfield')),
    keepLoggedIn: z.boolean().optional(),
  })

  type FormLoginSchema = z.infer<typeof formLoginSchema>

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormLoginSchema>({
    resolver: zodResolver(formLoginSchema),
    mode: 'onChange',
  })

  const emailValue = watch('email')
  const passwordValue = watch('password')
  const keepLoggedInValue = watch('keepLoggedIn')

  async function handleHomeFormLogin(data: FormLoginSchema) {
    try {
      const domain = window.location.hostname
      const {
        data: { id: customer },
      } = await getCustomerData(domain)

      const userData = await homeLogin({
        email: data.email,
        password: data.password,
        keepLoggedIn: data?.keepLoggedIn,
        customer,
      })

      if (userData) {
        setIsLoggedIn(true)
        setMe(userData)
        handleClose()
        reset()
      }

      await fetchConfigs(domain)
    } catch (error) {
      setError('email', { type: 'custom' })
      setError('password', { type: 'custom' })
      showToast(
        'error',
        t('Errors.Incorrectemailorpassword'),
        5000,
        'bottom-left',
      )
    }
  }

  return (
    <>
      <Dialog
        position="aside"
        title={t('Home.headerMenu.Signin')}
        open={open}
        className="w-[531px] max-w-none !p-0"
        onClose={() => {
          handleClose()
          reset()
        }}
        isDarkMode
        removeHeaderPaddingX
      >
        <form
          onSubmit={handleSubmit(handleHomeFormLogin)}
          className="flex flex-col pt-s items-center gap-xm"
        >
          <div className="flex flex-col gap-[8px] items-center w-[328px]">
            <Textfield
              value={emailValue}
              placeholder={t('Home.loginForm.emailPlaceholder')}
              type="email"
              {...register('email')}
              variant={errors.email && 'error'}
              validationMessages={
                errors.email?.message ? [{ message: errors.email.message }] : []
              }
              isDarkMode
            />
            <Textfield
              value={passwordValue}
              placeholder={t('Home.loginForm.passwordPlaceholder')}
              type="password"
              {...register('password')}
              variant={errors.password && 'error'}
              validationMessages={
                errors.password?.message
                  ? [{ message: errors.password.message }]
                  : []
              }
              isDarkMode
            />
            <span className="text-BODY-XM font-Regular leading-4 underline">
              <button
                type="button"
                onClick={() => setIsOpenFormHome(true)}
                className="text-grey-300 text-BODY-XM font-Medium"
              >
                {t('Home.loginForm.iforgotmypassword')}
              </button>
            </span>
            <div className="flex w-full pt-s pb-xs gap-xs items-center">
              <Checkbox
                id="keepLoggedIn"
                {...register('keepLoggedIn')}
                checked={keepLoggedInValue}
                isBrandCheckbox
                isDarkMode
              />
              <label
                htmlFor="keepLoggedIn"
                className="text-BODY-XM font-Medium"
                style={{ color: 'white' }}
              >
                {t('Home.loginForm.keeploggedin')}
              </label>
            </div>
          </div>
          <div className="flex px-m flex-col justify-center items-center gap-m self-stretch">
            <Button
              type="submit"
              size="lg"
              width={160}
              disabled={!isValid || isSubmitting}
              isBrandButton
            >
              {t('Home.loginForm.submit')}
            </Button>
            <span className="text-BODY-XM" style={{ color: 'white' }}>
              {t('Home.loginForm.donthaveanaccount')}{' '}
              <a
                href="/register"
                className="font-Bold text-fichasPay-main-400"
                onClick={(e) => {
                  e.preventDefault()
                  handleClose()
                  reset()
                  onOpenForm()
                }}
              >
                {t('Home.loginForm.register')}
              </a>
            </span>
          </div>
        </form>
      </Dialog>
    </>
  )
}
