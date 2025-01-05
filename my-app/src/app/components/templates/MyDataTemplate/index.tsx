'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/atoms/Button'
import Textfield from '@/components/atoms/Textfield'
import { FiUser, FiEdit } from 'react-icons/fi'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { showToast } from '@/components/atoms/Toast'
import validateCPF from '@/utils/validateCPF'
import validatePhone from '@/utils/validatePhone'
import { getUserData, updateUserData } from '@/services/user/user'
import PanelTemplate from '@/components/templates/PanelTemplate'
import Cookies from 'js-cookie'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'
import { useMe } from '@/stores/Me'

export function MyData() {
  const t = useTranslations()
  const { me, setMe } = useMe()

  const [initialValues, setInitialValues] = useState({
    employeeName: '',
    employeeCPF: '',
    employeeEmail: '',
    employeeTel: '',
  })

  const formMyDataSchema = z.object({
    employeeName: z.string().optional(),
    employeeCPF: z
      .string()
      .refine((val) => validateCPF(val), t('Errors.invalidCpf'))
      .optional(),
    employeeEmail: z.string().email(t('Errors.invalidEmail')),
    employeeTel: z
      .string()
      .refine((val) => validatePhone(val), t('Errors.invalidPhone'))
      .optional(),
  })

  type FormMyDataSchema = z.infer<typeof formMyDataSchema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormMyDataSchema>({
    resolver: zodResolver(formMyDataSchema),
    mode: 'onChange',
    defaultValues: initialValues,
  })

  const employeeNameValue = watch('employeeName')
  const employeeCPFValue = watch('employeeCPF')
  const employeeEmailValue = watch('employeeEmail')
  const employeeTelValue = watch('employeeTel')

  const [isChanged, setIsChanged] = useState(false)

  const removeEmojis = (str: string) => {
    return str.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let input = event.target.value.replace(/\D/g, '')

    if (input.length > 11) {
      input = input.slice(0, 11)
    }

    const formatted = input.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')

    setValue('employeeTel', formatted, { shouldValidate: true })
  }

  const handleCPFChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let input = event.target.value.replace(/\D/g, '')

    if (input.length > 11) {
      input = input.slice(0, 11)
    }

    const formatted = input.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2}).*/,
      '$1.$2.$3-$4',
    )

    setValue('employeeCPF', formatted, { shouldValidate: true })
  }

  useEffect(() => {
    if (me?.user) {
      const values = {
        employeeName: me.user.name ?? '',
        employeeCPF: me.user.document
          ? cpfFormatter.mask(me.user.document)
          : '',
        employeeEmail: me.user.email ?? '',
        employeeTel: me.user.phone ? phoneFormatter.mask(me.user.phone) : '',
      }
      setInitialValues(values)
      setValue('employeeName', values.employeeName)
      setValue('employeeCPF', values.employeeCPF)
      setValue('employeeEmail', values.employeeEmail)
      setValue('employeeTel', values.employeeTel)
    }
  }, [me, setValue])

  useEffect(() => {
    const currentValues = {
      employeeName: employeeNameValue,
      employeeCPF: employeeCPFValue,
      employeeEmail: employeeEmailValue,
      employeeTel: employeeTelValue,
    }
    setIsChanged(
      JSON.stringify(initialValues) !== JSON.stringify(currentValues),
    )
  }, [
    employeeNameValue,
    employeeCPFValue,
    employeeEmailValue,
    employeeTelValue,
    initialValues,
  ])

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = removeEmojis(event.target.value)
    setValue('employeeName', cleanValue, { shouldValidate: true })
  }

  async function handleFormMyData(data: FormMyDataSchema) {
    if (!me.user) {
      showToast('error', t('Errors.userNotFound'), 5000, 'bottom-left')
      return
    }

    try {
      const res = await updateUserData({
        name: data.employeeName,
        document: data.employeeCPF,
        phone: data.employeeTel,
      })
      if (res) {
        Cookies.set(
          'user',
          JSON.stringify({
            ...me.user,
            name: data.employeeName,
            document: data.employeeCPF,
            email: data.employeeEmail,
            phone: data.employeeTel,
          }),
        )
        showToast(
          'success',
          t('Panel.MyData.MyDataForm.dataSaved'),
          5000,
          'bottom-left',
        )
        setInitialValues({
          employeeName: data.employeeName ?? '',
          employeeCPF: data.employeeCPF ?? '',
          employeeEmail: data.employeeEmail,
          employeeTel: data.employeeTel ?? '',
        })
        setIsChanged(false)
        const userData = await getUserData()
        setMe(userData.data)
      } else {
        showToast('error', t('Errors.myDataError'), 5000, 'bottom-left')
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          'error',
          `${t(`Errors.${error.message}`)}`,
          5000,
          'bottom-left',
        )
      }
    }
  }

  return (
    <PanelTemplate
      title={t('Panel.MyData.User')}
      icon={<FiUser className="h-m w-m" />}
      headerContent={<></>}
    >
      <form onSubmit={handleSubmit(handleFormMyData)}>
        <div className="flex p-s sm:px-xs sm:py-s flex-col justify-end items-end sm:items-center gap-xm self-stretch rounded-sm bg-grey-300 shadow-DShadow-Special-X">
          <div className="flex items-center gap-xs self-stretch">
            <h6 className="text-grey-900 font-Regular text-H6">
              {t('Panel.MyData.MyDataForm.MyData')}
            </h6>
          </div>
          <hr className="w-full text-grey-600" />
          <div className="flex items-center gap-xm self-stretch sm:grid sm:grid-cols-1">
            <div className="flex justify-center">
              <div className="flex justify-end items-end cursor-not-allowed relative">
                <div className="bg-grey-500 w-[128px] h-[128px] rounded-xxl flex items-center justify-center">
                  <FiUser className="h-[64px] w-[64px] text-grey-700" />
                </div>
                <div className="h-[32px] w-[32px] bg-grey-400 rounded-xxl flex items-center justify-center absolute">
                  <FiEdit className="h-[16px] w-[16px] text-grey-700" />
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-1 justify-center items-center gap-s self-stretch">
                <Textfield
                  value={employeeNameValue}
                  placeholder={t('Panel.MyData.MyDataForm.namePlaceholder')}
                  type="text"
                  {...register('employeeName', {
                    onChange: handleNameChange,
                  })}
                  variant={errors.employeeName && 'error'}
                  validationMessages={
                    errors.employeeName?.message
                      ? [{ message: errors.employeeName.message }]
                      : []
                  }
                />
                <Textfield
                  value={employeeCPFValue}
                  placeholder={t(
                    'Panel.MyData.MyDataForm.employeeCPFPlaceholder',
                  )}
                  type="text"
                  inputMode="numeric"
                  {...register('employeeCPF')}
                  onChange={handleCPFChange}
                  variant={errors.employeeCPF && 'error'}
                  validationMessages={
                    errors.employeeCPF?.message
                      ? [{ message: errors.employeeCPF.message }]
                      : []
                  }
                />
                <Textfield
                  value={employeeEmailValue}
                  placeholder={t('Panel.MyData.MyDataForm.emailPlaceholder')}
                  type="email"
                  {...register('employeeEmail')}
                  disabled={true}
                />
                <Textfield
                  value={employeeTelValue}
                  placeholder={t('Panel.MyData.MyDataForm.phonePlaceholder')}
                  type="text"
                  inputMode="tel"
                  {...register('employeeTel')}
                  onChange={handlePhoneChange}
                  variant={errors.employeeTel && 'error'}
                  validationMessages={
                    errors.employeeTel?.message
                      ? [{ message: errors.employeeTel.message }]
                      : []
                  }
                />
              </div>
            </div>
          </div>
          <Button type="submit" disabled={!isValid || !isChanged}>
            {t('Panel.MyData.MyDataForm.submitButtonText')}
          </Button>
        </div>
      </form>
    </PanelTemplate>
  )
}
