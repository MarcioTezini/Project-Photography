import React, { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import Textfield from '@/components/atoms/Textfield'
import { useTranslations } from 'next-intl'
import useAddressDialogStore from '@/stores/AddressDialogStore'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/atoms/Button'
import { FiArrowLeft } from 'react-icons/fi'
import { getUserData, updateUserAddress } from '@/services/user/user'
import { isEqual } from 'lodash'
import { showToast } from '@/components/atoms/Toast'
import formatCep from '@/utils/cep'

type FormField =
  | 'endereco.cep'
  | 'endereco.neighborhood'
  | 'endereco.city'
  | 'endereco.address'
  | 'endereco.extra'
  | 'endereco.number'
  | 'endereco.state'

export function FormHomeAddress() {
  const t = useTranslations('Home.DialogAddress')
  const formRef = useRef<HTMLFormElement>(null)
  const { handleCloseDialog } = useAddressDialogStore()

  const [cep, setCep] = useState<string>('')
  const [addressData, setAddressData] = useState({
    address: '',
    number: '',
    extra: '',
    neighborhood: '',
    city: '',
    state: '',
  })
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const schema = z.object({
    endereco: z.object({
      cep: z.string().min(10, t('Errors.requiredfield')),
      number: z
        .string()
        .trim()
        .min(1, t('Errors.requiredfield'))
        .refine((value) => value !== '0', t('Errors.numberCantBe0')),
      address: z.string().trim().min(1, t('Errors.requiredfield')),
      extra: z.string().trim().optional(),
      neighborhood: z.string().trim().min(1, t('Errors.requiredfield')),
      city: z.string().trim().min(1, t('Errors.requiredfield')),
      state: z.string().trim().min(1, t('Errors.requiredfield')),
    }),
  })

  type FormValues = z.infer<typeof schema>

  const [initialValues, setInitialValues] = useState<FormValues | null>(null)

  const {
    control,
    setValue,
    reset,
    getValues,
    handleSubmit,
    watch,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      endereco: {
        cep: '',
        address: '',
        number: '',
        extra: '',
        neighborhood: '',
        city: '',
        state: '',
      },
    },
  })

  const watchedValues = watch()

  const fetchMeData = async () => {
    setIsDataLoaded(false)
    try {
      const { data } = await getUserData()

      if (data) {
        const number =
          data?.user?.address?.number != null
            ? String(data?.user?.address?.number)
            : ''
        const fetchedValues = {
          endereco: {
            cep: formatCep(data?.user?.address?.cep as string),
            neighborhood: data?.user?.address?.neighborhood as string,
            city: data?.user?.address?.city as string,
            address: data?.user?.address?.address as string,
            extra: data?.user?.address?.extra as string,
            number,
            state: data?.user?.address?.state as string,
          },
        }

        setInitialValues(fetchedValues)

        setIsDataLoaded(true)
        setIsFormChanged(false)
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      setIsDataLoaded(true)
      console.error('Error fetching me data:', error)
    }
  }

  useEffect(() => {
    reset()
    fetchMeData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, '')
    const fetchAddress = async () => {
      try {
        if (/^\d{8}$/.test(cleanCep)) {
          const response = await fetch(
            `https://viacep.com.br/ws/${cleanCep}/json/`,
          )
          if (!response.ok) {
            throw new Error('Erro na resposta da API')
          }

          const data = await response.json()

          const logradouro = data.logradouro || ''
          const neighborhood = data.bairro || ''
          const city = data.localidade || ''
          const state = data.uf || ''
          const extra = data.complemento || ''

          setAddressData({
            address: logradouro,
            number: '',
            extra,
            neighborhood,
            city,
            state,
          })
          clearErrors()
        }
      } catch (error) {
        console.error('Erro ao buscar o CEP:', error)
      }
    }

    if (cleanCep.length === 8) {
      fetchAddress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep, setAddressData])

  useEffect(() => {
    setValue('endereco.address', addressData.address)
    setValue('endereco.number', addressData.number)
    setValue('endereco.extra', addressData.extra)
    setValue('endereco.neighborhood', addressData.neighborhood)
    setValue('endereco.city', addressData.city)
    setValue('endereco.state', addressData.state)
  }, [addressData, setValue])

  useEffect(() => {
    if (initialValues) {
      const validateAndSetValue = (
        field: FormField,
        value: string | number | undefined,
      ) => {
        if (value !== undefined && value !== null) {
          setValue(field, String(value))
        }
      }

      if (initialValues.endereco) {
        validateAndSetValue(
          'endereco.cep',
          formatCep(initialValues.endereco.cep ?? '') || '',
        )
        validateAndSetValue(
          'endereco.neighborhood',
          initialValues.endereco.neighborhood || '',
        )
        validateAndSetValue('endereco.city', initialValues.endereco.city || '')
        validateAndSetValue(
          'endereco.address',
          initialValues.endereco.address || '',
        )
        validateAndSetValue(
          'endereco.extra',
          initialValues.endereco.extra || '',
        )
        validateAndSetValue(
          'endereco.number',
          initialValues.endereco.number || '',
        )
        validateAndSetValue(
          'endereco.state',
          initialValues.endereco.state || '',
        )
      }
    }
  }, [initialValues, setValue])

  useEffect(() => {
    const formValues = getValues()

    if (initialValues !== null && isDataLoaded) {
      const hasFormValuesChanged = !isEqual(initialValues, formValues)

      if (hasFormValuesChanged) {
        setIsFormChanged(true)
      } else {
        setIsFormChanged(false)
      }
    }
  }, [watchedValues, initialValues, isDataLoaded, getValues])

  useEffect(() => {
    if (initialValues === null && isValid) {
      setHasUnsavedChanges(true)
    } else if (initialValues !== null && isValid && isFormChanged) {
      setHasUnsavedChanges(true)
    } else {
      setHasUnsavedChanges(false)
    }
  }, [isValid, initialValues, isFormChanged])

  const onSubmit = async (data: FormValues) => {
    try {
      const { endereco } = data
      const response = await updateUserAddress(endereco)
      if (response) {
        handleCloseDialog()
        showToast('success', t('success'), 5000, 'bottom-left')
      }
    } catch (error) {
      showToast('error', t('Errors.errorSaving'), 5000, 'bottom-left')
    }
  }

  return (
    <form
      ref={formRef}
      className="grid p-xm justify-center items-center gap-s self-stretch"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="w-[328px] m-auto">
        <div className="flex flex-col gap-xs">
          <Controller
            name="endereco.cep"
            control={control}
            render={({ field }) => (
              <Textfield
                placeholder={t('zipCode')}
                {...field}
                value={field.value || ''}
                maxLength={10}
                inputMode="numeric"
                inputClassname="!h-[42px] !pt-[12px]"
                onKeyDown={(e) => {
                  const currentValue = field.value || ''
                  if (
                    currentValue.length >= 8 &&
                    e.key !== 'Backspace' &&
                    e.key !== 'Delete'
                  ) {
                    e.preventDefault()
                  }
                }}
                onChange={(e) => {
                  const { value } = e.target

                  setCep(value)
                  field.onChange(formatCep(value))
                }}
                isDarkMode
                variant={errors.endereco?.cep ? 'error' : undefined}
                validationMessages={
                  errors.endereco?.cep
                    ? [
                        {
                          message: errors.endereco?.cep.message as string,
                        },
                      ]
                    : []
                }
              />
            )}
          />

          <Controller
            name="endereco.address"
            control={control}
            render={({ field }) => (
              <Textfield
                placeholder={t('street')}
                {...field}
                isDarkMode
                inputClassname="!h-[42px] !pt-[12px]"
                variant={errors.endereco?.address ? 'error' : undefined}
                validationMessages={
                  errors.endereco?.address
                    ? [
                        {
                          message: errors.endereco.address.message as string,
                        },
                      ]
                    : []
                }
              />
            )}
          />
          <div className="flex gap-xs">
            <Controller
              name="endereco.number"
              control={control}
              render={({ field }) => (
                <Textfield
                  placeholder={t('number')}
                  {...field}
                  isDarkMode
                  inputClassname="!h-[42px] !pt-[12px]"
                  variant={errors.endereco?.number ? 'error' : undefined}
                  validationMessages={
                    errors.endereco?.number
                      ? [
                          {
                            message: errors.endereco.number.message as string,
                          },
                        ]
                      : []
                  }
                />
              )}
            />

            <Controller
              name="endereco.extra"
              control={control}
              render={({ field }) => (
                <Textfield
                  placeholder={t('extra')}
                  {...field}
                  isDarkMode
                  inputClassname="!h-[42px] !pt-[12px]"
                  variant={errors.endereco?.extra ? 'error' : undefined}
                  validationMessages={
                    errors.endereco?.extra
                      ? [
                          {
                            message: errors.endereco.extra.message as string,
                          },
                        ]
                      : []
                  }
                />
              )}
            />
          </div>

          <Controller
            name="endereco.neighborhood"
            control={control}
            render={({ field }) => (
              <Textfield
                placeholder={t('neighborhood')}
                {...field}
                isDarkMode
                inputClassname="!h-[42px] !pt-[12px]"
                variant={errors.endereco?.neighborhood ? 'error' : undefined}
                validationMessages={
                  errors.endereco?.neighborhood
                    ? [
                        {
                          message: errors.endereco.neighborhood
                            .message as string,
                        },
                      ]
                    : []
                }
              />
            )}
          />

          <Controller
            name="endereco.city"
            control={control}
            render={({ field }) => (
              <Textfield
                placeholder={t('city')}
                {...field}
                isDarkMode
                inputClassname="!h-[42px] !pt-[12px]"
                variant={errors.endereco?.city ? 'error' : undefined}
                validationMessages={
                  errors.endereco?.city
                    ? [
                        {
                          message: errors.endereco.city.message as string,
                        },
                      ]
                    : []
                }
              />
            )}
          />

          <Controller
            name="endereco.state"
            control={control}
            render={({ field }) => (
              <Textfield
                placeholder={t('state')}
                {...field}
                maxLength={2}
                isDarkMode
                inputClassname="!h-[42px] !pt-[12px]"
                variant={errors.endereco?.state ? 'error' : undefined}
                validationMessages={
                  errors.endereco?.state
                    ? [
                        {
                          message: errors.endereco.state.message as string,
                        },
                      ]
                    : []
                }
              />
            )}
          />
        </div>
      </div>
      <div className="my-m flex flex-col gap-m">
        <div className="flex items-center gap-s justify-center pb-s">
          <Button
            preIcon={<FiArrowLeft width={20} height={20} />}
            type="button"
            size="lg"
            variant="outline"
            className="text-[#fff!important] hover:bg-grey-800"
            width={110}
            noBorder
            noShadow
            onClick={() => {
              handleCloseDialog()
            }}
          >
            {t('buttonBack')}
          </Button>

          <Button
            type="submit"
            size="lg"
            width={160}
            variant="primary"
            noBorder
            noShadow
            disabled={!hasUnsavedChanges}
          >
            {t('buttonSave')}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default FormHomeAddress
