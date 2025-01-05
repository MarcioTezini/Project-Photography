import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { ReactSortable, SortableEvent } from 'react-sortablejs'
import Selector from '@/components/atoms/Select'
import Textfield from '@/components/atoms/Textfield'
import {
  BiLogoInstagramAlt,
  BiLogoFacebook,
  BiLogoLinkedin,
  BiLogoTelegram,
  BiLogoYoutube,
  BiLogoSpotify,
  BiLogoTiktok,
} from 'react-icons/bi'
import { BsTwitterX, BsAlexa } from 'react-icons/bs'
import { RiWhatsappFill } from 'react-icons/ri'
import { TableWarningButton } from '@/components/atoms/TableWarningButton'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import Image from 'next/image'
import sortableIcon from '../../../../public/images/icons/icon-sortable-item.svg'
import { v4 as uuidv4 } from 'uuid'
import { PanelAccordion } from '@/components/molecules/Accordion'
import Divider from '@/components/atoms/Divider'
import Button from '@/components/atoms/Button'
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiLoader,
  FiPlusCircle,
} from 'react-icons/fi'
import { saveFooterConfig } from '@/services/config'
import Dialog from '@/components/molecules/Dialog'
import { showToast } from '@/components/atoms/Toast'
import { useClientStore } from '@/stores/ClientStore'
import { useDebounce } from '@/hooks/useDebounce'
import { isEqual } from 'lodash'
import { useMediaQuery } from 'react-responsive'
import { getUserData } from '@/services/user/user'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'

interface SocialLink {
  id: string
  platform: string
  url: string
  order?: number
}

type SocialPlatformOption = {
  label: string
  value: string
  icon: React.ReactElement
}

const socialPlatforms: SocialPlatformOption[] = [
  { label: 'Facebook', value: 'facebook', icon: <BiLogoFacebook /> },
  { label: 'X (Twitter)', value: 'twitter', icon: <BsTwitterX /> },
  { label: 'Instagram', value: 'instagram', icon: <BiLogoInstagramAlt /> },
  { label: 'LinkedIn', value: 'linkedin', icon: <BiLogoLinkedin /> },
  { label: 'Telegram', value: 'telegram', icon: <BiLogoTelegram /> },
  { label: 'YouTube', value: 'youtube', icon: <BiLogoYoutube /> },
  { label: 'Spotify', value: 'spotify', icon: <BiLogoSpotify /> },
  { label: 'Alexa', value: 'alexa', icon: <BsAlexa /> },
  { label: 'WhatsApp', value: 'whatsApp', icon: <RiWhatsappFill /> },
  { label: 'TikTok', value: 'tikTok', icon: <BiLogoTiktok /> },
]

const SocialLinksForm: React.FC = () => {
  const t = useTranslations()
  const [cep, setCep] = useState<string>('')
  const [addressData, setAddressData] = useState({
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
  })
  const [panelOpen, setPanelOpen] = useState(false)
  const { hasUnsavedChanges, setIsSaveChangesDialogOpen } =
    useSaveChangesDialogStore()
  const [isAddressReadOnly, setIsAddressReadOnly] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const isFirstRender = useRef(true)
  const { selectedClient } = useClientStore()
  const { setHasUnsavedChanges, setOnSubmit } = useSaveChangesDialogStore()
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [isOrderChanged, setIsOrderChanged] = useState(false)
  const isSmallScreen = useMediaQuery({ query: '(max-width: 679px)' })

  const [availablePlatforms, setAvailablePlatforms] =
    useState<SocialPlatformOption[]>(socialPlatforms)
  const [openDialog, setOpenDialog] = useState(false)
  const [canAddLink, setCanAddLink] = useState(false)

  const schema = z.object({
    socialLinks: z.array(
      z.object({
        id: z.string(),
        platform: z.string().min(1, t('Panel.Footer.FormFooter.ErrorPlatform')),
        url: z
          .string()
          .min(1, t('Errors.EmptyLink'))
          .refine(
            (val) => !val || /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(val),
            {
              message: t('Errors.InvalidLink'),
            },
          )
          .optional(),
        order: z.number().optional(),
      }),
    ),

    companyName: z
      .string()
      .min(1, t('Panel.Footer.FormFooter.ErrorCompanyName')),
    phoneNumber: z.string().optional(),
    email: z
      .string()
      .email(t('Errors.PleasefillintheEmailfield'))
      .optional()
      .or(z.literal('')),
    cnpj: z.string().min(18, t('Panel.Footer.FormFooter.ErrorCnpj')),

    endereco: z.union([
      z
        .object({
          cep: z.string().optional(),
          numero: z
            .string()
            .optional()
            .transform((val) => val || '')
            .refine((value) => value !== '0'),
          rua: z.string().optional(),
          complemento: z.string().optional(),
          bairro: z.string().optional(),
          cidade: z.string().optional(),
          uf: z.string().optional(),
        })
        .refine((values) => !values.cep || !!values.numero, {
          path: ['numero'],
        }),
      z.object({
        cep: z.string().optional(),
        numero: z
          .string()
          .min(1)
          .refine((value) => value !== '0'),
        rua: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        uf: z.string().optional(),
      }),
    ]),
  })

  type FormValues = z.infer<typeof schema>

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    getValues,
    reset,
    clearErrors,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      socialLinks: [{ id: uuidv4(), platform: '', url: '' }],
      companyName: '',
      cnpj: '',
      endereco: {
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
      },
      phoneNumber: '',
      email: '',
    },
  })

  const socialLinks = watch('socialLinks')
  const watchedValues = watch()
  const phoneNumber = watch('phoneNumber')
  const email = watch('email')
  const companyName = watch('companyName')
  const cnpj = watch('cnpj')
  const [initialValues, setInitialValues] = useState<FormValues | null>(null)
  const selectedPlatforms = socialLinks
    .filter((link) => link.platform)
    .map((link) => link.platform)
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'socialLinks',
  })

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        if (/^\d{8}$/.test(cep)) {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
          if (!response.ok) {
            throw new Error('Erro na resposta da API')
          }

          const data = await response.json()

          const logradouro = data.logradouro || ''
          const bairro = data.bairro || ''
          const localidade = data.localidade || ''
          const uf = data.uf || ''
          const complemento = data.complemento || ''

          setAddressData({
            rua: logradouro,
            numero: '',
            complemento,
            bairro,
            cidade: localidade,
            uf,
          })

          const isValidAddress = logradouro && bairro && localidade && uf

          setIsAddressReadOnly(isValidAddress)
        } else {
          setIsAddressReadOnly(false)
        }
      } catch (error) {
        console.error('Erro ao buscar o CEP:', error)
        setIsAddressReadOnly(false)
      }
    }

    if (cep.length === 8) {
      fetchAddress()
    } else {
      setIsAddressReadOnly(false)
    }
  }, [cep, setAddressData, setIsAddressReadOnly])

  useEffect(() => {
    setValue('endereco.rua', addressData.rua)
    setValue('endereco.numero', addressData.numero)
    setValue('endereco.complemento', addressData.complemento)
    setValue('endereco.bairro', addressData.bairro)
    setValue('endereco.cidade', addressData.cidade)
    setValue('endereco.uf', addressData.uf)
  }, [addressData, setValue])

  useEffect(() => {
    const allLinksComplete = socialLinks.every(
      (link) => !!link.platform && !!link.url,
    )
    const uniquePlatforms = new Set(selectedPlatforms)
    const allPlatformsSelected = uniquePlatforms.size >= socialPlatforms.length

    setCanAddLink(allLinksComplete && !allPlatformsSelected)
  }, [socialLinks, selectedPlatforms])

  useEffect(() => {
    const updatedPlatforms = socialPlatforms.map((platform) => ({
      ...platform,
      disabled: selectedPlatforms.includes(platform.value),
    }))

    if (
      JSON.stringify(updatedPlatforms) !== JSON.stringify(availablePlatforms)
    ) {
      setAvailablePlatforms(updatedPlatforms)
    }
  }, [selectedPlatforms, availablePlatforms])

  useEffect(() => {}, [openDialog])
  function maskCpfCnpj(value: string): string {
    const cleanValue = value.replace(/\D/g, '')

    if (cleanValue.length <= 11) {
      return cleanValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      return cleanValue
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    }
  }

  useEffect(() => {
    if (!hasUnsavedChanges && isSubmitting) {
      setIsSaveChangesDialogOpen(false)
    }
  }, [hasUnsavedChanges, isSubmitting, setIsSaveChangesDialogOpen])

  const onSortEnd = ({ oldIndex, newIndex }: SortableEvent) => {
    if (typeof oldIndex === 'number' && typeof newIndex === 'number') {
      const originalLinks = [...fields]

      move(oldIndex, newIndex)

      fields.forEach((_, index) => {
        setValue(`socialLinks.${index}.order`, index)
      })

      const reorderedState = fields.map((_, index) => ({
        ...fields[index],
        order: index,
      }))

      const hasOrderChanged = !isEqual(originalLinks, reorderedState)

      setIsOrderChanged(hasOrderChanged)
    } else {
      console.error('Índices inválidos para ordenação:', { oldIndex, newIndex })
    }
  }

  const handleDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  function formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '')

    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/)

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }

    return phoneNumber
  }

  function formatCep(cep: string): string {
    const cleaned = cep.replace(/\D/g, '')

    const limitedCep = cleaned.substring(0, 8)

    const match = limitedCep.match(/^(\d{5})(\d{3})$/)

    if (match) {
      return `${match[1]}-${match[2]}`
    }

    return limitedCep
  }

  const fetchMeData = async () => {
    setIsDataLoaded(false)
    try {
      const { data } = await getUserData()

      if (data) {
        const fetchedValues = {
          companyName: data?.configs?.footer?.companyName,
          cnpj: maskCpfCnpj(data?.configs?.footer?.taxId),
          endereco: {
            cep: formatCep(data?.configs?.footer?.address?.postalCode),
            bairro: data?.configs?.footer?.address?.neighborhood,
            cidade: data?.configs?.footer?.address?.city,
            rua: data?.configs?.footer?.address?.street,
            complemento: data?.configs?.footer?.address?.complement,
            numero: data?.configs?.footer?.address?.number,
            uf: data?.configs?.footer?.address?.state,
          },
          email: data?.configs?.footer?.email,
          phoneNumber: formatPhoneNumber(data?.configs?.footer?.phoneNumber),
          socialLinks: (data?.configs?.footer?.socialLinks || []).map(
            (link) => ({
              id: uuidv4(),
              platform: link.platform,
              url: link.url,
              order: link.order,
            }),
          ),
        }

        setInitialValues(fetchedValues)

        if (!fetchedValues.endereco.cep) {
          setIsAddressReadOnly(false)
        }

        setIsDataLoaded(true)
        setIsFormChanged(false)
        setHasUnsavedChanges(false)
        clearErrors()
      }
    } catch (error) {
      setIsDataLoaded(true)
      console.error('Error fetching me data:', error)
    }
  }

  const fetchMeDataDebounced = useDebounce(fetchMeData, 1000)

  useEffect(() => {
    reset()
    fetchMeData().then(() => {
      setTimeout(() => {
        isFirstRender.current = false
      }, 1000)
    })
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      reset()
      fetchMeDataDebounced()
    }
  }, [selectedClient])

  type FormField =
    | 'companyName'
    | 'cnpj'
    | 'email'
    | 'phoneNumber'
    | 'endereco.cep'
    | 'endereco.bairro'
    | 'endereco.cidade'
    | 'endereco.rua'
    | 'endereco.complemento'
    | 'endereco.numero'
    | 'endereco.uf'
    | `socialLinks.${number}`
    | `socialLinks.${number}.id`
    | `socialLinks.${number}.platform`
    | `socialLinks.${number}.url`
    | `socialLinks.${number}.order`

  useEffect(() => {
    if (initialValues) {
      const validateAndSetValue = (
        field: FormField,
        value: string | number | undefined,
      ) => {
        if (value !== undefined && value !== null) {
          setValue(field, value)
        }
      }

      validateAndSetValue('companyName', initialValues.companyName || '')
      validateAndSetValue('cnpj', maskCpfCnpj(initialValues.cnpj) || '')

      if (initialValues.endereco) {
        validateAndSetValue(
          'endereco.cep',
          formatCep(initialValues.endereco.cep ?? '') || '',
        )
        validateAndSetValue(
          'endereco.bairro',
          initialValues.endereco.bairro || '',
        )
        validateAndSetValue(
          'endereco.cidade',
          initialValues.endereco.cidade || '',
        )
        validateAndSetValue('endereco.rua', initialValues.endereco.rua || '')
        validateAndSetValue(
          'endereco.complemento',
          initialValues.endereco.complemento || '',
        )
        validateAndSetValue(
          'endereco.numero',
          initialValues.endereco.numero || '',
        )
        validateAndSetValue('endereco.uf', initialValues.endereco.uf || '')
      }

      validateAndSetValue('email', initialValues.email || '')
      validateAndSetValue(
        'phoneNumber',
        formatPhoneNumber(initialValues.phoneNumber ?? '') || '',
      )

      const formattedLinks: SocialLink[] = initialValues.socialLinks.map(
        (link) => ({
          id: link.id,
          platform: link.platform || '',
          url: link.url || '',
          order: typeof link.order === 'number' ? link.order : undefined,
        }),
      )

      setValue('socialLinks', formattedLinks)
    }
  }, [initialValues, setValue])

  useEffect(() => {
    const formValues = getValues()

    if (initialValues !== null && isDataLoaded) {
      const hasFormValuesChanged = !isEqual(initialValues, formValues)

      if (hasFormValuesChanged || isOrderChanged) {
        setIsFormChanged(true)
      } else {
        setIsFormChanged(false)
      }
    }
  }, [watchedValues, isOrderChanged, initialValues, isDataLoaded, getValues])

  const onSubmit = useCallback(
    async (data: FormValues) => {
      try {
        const orderedSocialLinks = data.socialLinks.map((link, index) => ({
          platform: link.platform ?? '',
          url: link.url ?? '',
          order: index,
          id: link.id,
        }))

        const formData = {
          footer: {
            socialLinks: orderedSocialLinks,
            companyName: data.companyName ?? '',
            phoneNumber: data.phoneNumber ?? '',
            email: data.email ?? '',
            taxId: data.cnpj ?? '',
            address: {
              postalCode: data.endereco.cep ?? '',
              street: data.endereco.rua ?? '',
              number: data.endereco.numero ?? '',
              complement: data.endereco.complemento ?? '',
              neighborhood: data.endereco.bairro ?? '',
              city: data.endereco.cidade ?? '',
              state: data.endereco.uf ?? '',
            },
          },
        }
        await saveFooterConfig(formData)
        await fetchMeData()
        setHasUnsavedChanges(false)

        showToast(
          'success',
          t('Panel.Whitelist.FormWhitelist.agentUpdate'),
          5000,
          'bottom-left',
        )
        setOpenDialog(false)
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saveFooterConfig],
  )

  const updateForm = useCallback(async () => {
    if (formRef.current) {
      await handleSubmit(onSubmit)()
    }
  }, [handleSubmit, onSubmit])

  const handleRemove = (index: number) => {
    remove(index)
  }

  useEffect(() => {
    if (initialValues === null && isValid) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(updateForm)())
    } else if (initialValues !== null && isValid && isFormChanged) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(updateForm)())
    } else {
      setHasUnsavedChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, handleSubmit, initialValues, isFormChanged])

  return (
    <>
      {!isDataLoaded ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <FiLoader className="animate-spin text-H3 text-grey-500" />
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <div className="pb-m text-grey-900">
            <h1>{`${t('Panel.Footer.SocialNetworks')}`}</h1>
          </div>
          <div>
            <ReactSortable
              list={fields}
              setList={() => {}}
              animation={150}
              onEnd={onSortEnd}
            >
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={isSmallScreen ? 'justify-center' : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    gap: '16px',
                    paddingBottom: '10px',
                  }}
                >
                  <Image
                    src={sortableIcon}
                    alt="Sortable Icon"
                    className="cursor-grab"
                  />
                  <div
                    className={
                      isSmallScreen
                        ? 'flex flex-col gap-xs'
                        : 'flex w-full gap-s'
                    }
                  >
                    <Controller
                      control={control}
                      name={`socialLinks.${index}.platform`}
                      render={({ field: controllerField }) => (
                        <Selector
                          placeholder={t(
                            'Panel.Footer.FormFooter.SocialNetworks',
                          )}
                          variant="default"
                          iconColorVariant="info"
                          width={isSmallScreen ? 250 : 400}
                          value={controllerField.value}
                          onChange={(value) => {
                            controllerField.onChange(value)
                            setValue(`socialLinks.${index}.platform`, value)
                          }}
                          options={availablePlatforms.map((platform) => ({
                            label: platform.label,
                            value: platform.value,
                            icon: platform.icon,
                            disabled: selectedPlatforms.includes(
                              platform.value,
                            ),
                          }))}
                          optionsDisabled={(value) =>
                            selectedPlatforms.includes(value)
                          }
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name={`socialLinks.${index}.url`}
                      rules={{
                        validate: (value) => {
                          const isValidUrl =
                            /^https?:\/\/[^\s$.?#].[^\s]*$/gm.test(
                              String(value),
                            )
                          return isValidUrl || t('Errors.InvalidLink')
                        },
                      }}
                      render={({ field, fieldState: { error } }) => {
                        const platformValue = getValues(
                          `socialLinks.${index}.platform`,
                        )
                        const selectedPlatform = socialPlatforms.find(
                          (platform) => platform.value === platformValue,
                        )

                        return (
                          <div style={{ position: 'relative', width: '100%' }}>
                            <Textfield
                              placeholder={t('Panel.Footer.FormFooter.Link')}
                              type="text"
                              {...field}
                              variant={error ? 'error' : undefined}
                              onBlur={() => trigger(`socialLinks.${index}.url`)}
                              onChange={(e) => {
                                field.onChange(e.target.value)
                                trigger(`socialLinks.${index}.url`)
                                e.target.scrollLeft = e.target.scrollWidth
                              }}
                              style={{
                                overflow: 'auto',
                                whiteSpace: 'nowrap',
                                textAlign: 'left',
                                paddingRight: '40px',
                              }}
                              tooltip={
                                selectedPlatform && field.value ? (
                                  <div>
                                    <div
                                      style={{
                                        color: '#999999',
                                        width: '24px',
                                        height: '24px',
                                      }}
                                    >
                                      {React.cloneElement(
                                        selectedPlatform.icon,
                                        {
                                          style: {
                                            width: '24px',
                                            height: '24px',
                                          },
                                        },
                                      )}
                                    </div>
                                  </div>
                                ) : null
                              }
                            />
                            {error && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '-15px',
                                  left: '0',
                                  fontSize: '12px',
                                  color: '#6E0F0F',
                                  whiteSpace: 'nowrap',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                              >
                                <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
                                <span>{error.message}</span>{' '}
                              </div>
                            )}
                          </div>
                        )
                      }}
                    />
                  </div>
                  {field.platform && (
                    <TableWarningButton
                      name=""
                      onClick={() => handleRemove(index)}
                    />
                  )}
                </div>
              ))}
            </ReactSortable>
            <div className="flex justify-end">
              <Button
                variant="outline"
                addIcon={<FiPlusCircle width={18} height={18} />}
                width={130}
                onClick={() => append({ id: uuidv4(), platform: '', url: '' })}
                disabled={!canAddLink}
                noBorder
                noShadow
              >
                {t('Panel.Footer.FormFooter.AddLink')}
              </Button>
            </div>
          </div>
          <div className="py-xm">
            <PanelAccordion
              title={t('Panel.Footer.FormFooter.GeneralSettings')}
              open={panelOpen}
              onChange={(isOpen) => {
                setPanelOpen(isOpen)
              }}
            >
              <div className="flex flex-col gap-s justify-center py-s">
                <div className="flex flex-col gap-s justify-center py-s">
                  <div
                    className={
                      isSmallScreen ? 'flex flex-col gap-xs' : 'flex gap-s'
                    }
                  >
                    <Textfield
                      maxLength={40}
                      value={companyName}
                      placeholder={t('Panel.Footer.FormFooter.CompanyName')}
                      {...register('companyName', {
                        validate: (value) => {
                          if (value === '') {
                            return true
                          }
                          return (
                            value.length >= 2 || t('Errors.InvalidCompanyName')
                          )
                        },
                      })}
                      variant={errors.companyName && 'error'}
                      validationMessages={
                        errors.companyName?.message
                          ? [{ message: errors.companyName.message }]
                          : []
                      }
                      inputClassname="w-full"
                      onChange={(e) => {
                        setValue('companyName', e.target.value)
                        trigger('companyName')
                      }}
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement
                        const value = input.value
                        const validCharacters = /^[a-zA-Z0-9 .&-]*$/
                        if (!validCharacters.test(value)) {
                          input.value = value.replace(/[^a-zA-Z0-9 .&-]/g, '')
                        }
                      }}
                    />

                    <Textfield
                      maxLength={18}
                      placeholder={t('Panel.Footer.FormFooter.Cnpj')}
                      value={maskCpfCnpj(cnpj)}
                      {...register('cnpj', {
                        validate: (value) => {
                          if (value === '') {
                            return true
                          }
                          const isValidCnpj = maskCpfCnpj(value)
                          return isValidCnpj || t('Errors.InvalidCnpj')
                        },
                      })}
                      variant={errors.cnpj && 'error'}
                      validationMessages={
                        errors.cnpj?.message
                          ? [{ message: errors.cnpj.message }]
                          : []
                      }
                      inputClassname="w-full"
                      onChange={(e) => {
                        setValue('cnpj', e.target.value)
                        trigger('cnpj')
                      }}
                    />
                  </div>
                </div>

                <div
                  className={`flex ${isSmallScreen ? 'flex-col' : ''} flex gap-s`}
                >
                  <div
                    className={`flex ${isSmallScreen ? 'flex-row' : ''} gap-s w-full`}
                  >
                    <Controller
                      name="endereco.cep"
                      control={control}
                      render={({ field }) => (
                        <Textfield
                          placeholder={t('Panel.Footer.FormFooter.ZipCode')}
                          {...field}
                          value={field.value || ''}
                          maxLength={8}
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
                            const limitedValue = value.slice(0, 8)

                            setCep(limitedValue)
                            field.onChange(formatCep(limitedValue))

                            if (
                              limitedValue.trim() === '' ||
                              limitedValue.length < 8
                            ) {
                              setIsAddressReadOnly(false)
                            }
                          }}
                          variant={errors.endereco?.cep ? 'error' : undefined}
                          validationMessages={
                            errors.endereco?.cep
                              ? [
                                  {
                                    message: errors.endereco?.cep
                                      .message as string,
                                  },
                                ]
                              : []
                          }
                        />
                      )}
                    />

                    <Controller
                      name="endereco.bairro"
                      control={control}
                      render={({ field }) => (
                        <Textfield
                          placeholder={t(
                            'Panel.Footer.FormFooter.Neighborhood',
                          )}
                          {...field}
                          variant={
                            errors.endereco?.bairro ? 'error' : undefined
                          }
                          disabled={isAddressReadOnly}
                          validationMessages={
                            errors.endereco?.bairro
                              ? [
                                  {
                                    message: errors.endereco.bairro
                                      .message as string,
                                  },
                                ]
                              : []
                          }
                        />
                      )}
                    />
                  </div>

                  <div
                    className={`flex ${isSmallScreen ? 'flex-row' : 'flex-row w-[60%]'} gap-s`}
                  >
                    <Controller
                      name="endereco.cidade"
                      control={control}
                      render={({ field }) => (
                        <Textfield
                          placeholder={t('Panel.Footer.FormFooter.City')}
                          {...field}
                          variant={
                            errors.endereco?.cidade ? 'error' : undefined
                          }
                          disabled={isAddressReadOnly}
                          validationMessages={
                            errors.endereco?.cidade
                              ? [
                                  {
                                    message: errors.endereco.cidade
                                      .message as string,
                                  },
                                ]
                              : []
                          }
                        />
                      )}
                    />
                    <div className="w-[70px]">
                      <Controller
                        name="endereco.uf"
                        control={control}
                        render={({ field }) => (
                          <Textfield
                            placeholder={t('Panel.Footer.FormFooter.Uf')}
                            {...field}
                            maxLength={2}
                            disabled={isAddressReadOnly}
                            variant={errors.endereco?.uf ? 'error' : undefined}
                            validationMessages={
                              errors.endereco?.uf
                                ? [
                                    {
                                      message: errors.endereco.uf
                                        .message as string,
                                    },
                                  ]
                                : []
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full gap-s">
                  <Controller
                    name="endereco.rua"
                    control={control}
                    render={({ field }) => (
                      <Textfield
                        placeholder={t('Panel.Footer.FormFooter.Street')}
                        {...field}
                        variant={errors.endereco?.rua ? 'error' : undefined}
                        disabled={isAddressReadOnly}
                        validationMessages={
                          errors.endereco?.rua
                            ? [
                                {
                                  message: errors.endereco.rua
                                    .message as string,
                                },
                              ]
                            : []
                        }
                      />
                    )}
                  />
                  <div className="w-[100px]">
                    <Controller
                      name="endereco.numero"
                      control={control}
                      render={({ field }) => (
                        <Textfield
                          placeholder={t('Panel.Footer.FormFooter.Number')}
                          {...field}
                          variant={
                            errors.endereco?.numero ? 'error' : undefined
                          }
                        />
                      )}
                    />
                  </div>
                  <div
                    className={`flex ${isSmallScreen ? 'hidden' : 'w-[286px]'}`}
                  >
                    <Controller
                      name="endereco.complemento"
                      control={control}
                      render={({ field }) => (
                        <Textfield
                          placeholder={t('Panel.Footer.FormFooter.Complement')}
                          {...field}
                          variant={
                            errors.endereco?.complemento ? 'error' : undefined
                          }
                          validationMessages={
                            errors.endereco?.complemento
                              ? [
                                  {
                                    message: errors.endereco.complemento
                                      .message as string,
                                  },
                                ]
                              : []
                          }
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex gap-s">
                  <Textfield
                    maxLength={40}
                    value={phoneFormatter.mask(phoneNumber)}
                    placeholder={t('Panel.Footer.FormFooter.PhoneNumber')}
                    {...register('phoneNumber')}
                    variant={errors.phoneNumber && 'error'}
                    validationMessages={
                      errors.phoneNumber?.message
                        ? [{ message: errors.phoneNumber.message }]
                        : []
                    }
                    inputClassname="w-full"
                  />
                  <Textfield
                    maxLength={40}
                    value={email}
                    placeholder={t('Panel.Footer.FormFooter.Email')}
                    {...register('email')}
                    variant={errors.email && 'error'}
                    validationMessages={
                      errors.email?.message
                        ? [{ message: errors.email.message }]
                        : []
                    }
                    inputClassname="w-full"
                  />
                </div>
              </div>
              <Divider />
            </PanelAccordion>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              onClick={handleDialog}
              variant="primary"
              preDisabled={
                !isValid ||
                isSubmitting ||
                (!isFormChanged && initialValues !== null)
              }
            >
              {t('Panel.Footer.FormFooter.ButtonSave')}
            </Button>
          </div>
        </form>
      )}
      <Dialog
        title={t('Panel.Whitelist.FormWhitelist.ButtonSaved')}
        open={openDialog}
        onClose={handleCloseDialog}
        className="sm:max-w-[328px] max-w-[400px]"
        removeHeaderPaddingX
      >
        <div className="flex flex-col items-center justify-center gap-s my-xm">
          <FiAlertTriangle className="w-[64px] h-[64px] text-notify-alert-normal" />
          <p className="text-BODY-XM font-Regular text-grey-900 text-center px-s w-11/12">
            {t('Panel.Footer.FormFooter.TextModalSave')}
          </p>
          <strong className="text-grey-900 text-BODY-XM">
            {t('Panel.Whitelist.FormWhitelist.TextDialogSaved')}
          </strong>
          <div className="flex justify-center items-center gap-s self-stretch mt-xs">
            <Button
              className="cursor-pointer"
              preIcon={<FiArrowLeft className="w-[16px] h-[16px]" />}
              variant="text"
              onClick={handleCloseDialog}
            >
              {t('Panel.Whitelist.FormWhitelist.buttonBack')}
            </Button>
            <Button
              className="cursor-pointer"
              variant="success"
              onClick={updateForm}
            >
              <label className="text-grey-300">
                {t('Panel.Whitelist.FormWhitelist.ButtonSaved')}
              </label>
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default SocialLinksForm
