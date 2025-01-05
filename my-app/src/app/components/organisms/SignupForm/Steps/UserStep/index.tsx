import format from 'format-string-by-pattern'
import Textfield from '@/components/atoms/Textfield'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import BR from '../../../../../../public/images/flags/br.svg'
import ESP from '../../../../../../public/images/flags/esp.svg'
import EUA from '../../../../../../public/images/flags/eua.svg'
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronRight,
  FiAlertCircle,
} from 'react-icons/fi'
import Button from '@/components/atoms/Button'
import { useSignupStore } from '@/stores/SignupStore'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { SendUserPersonalData } from '@/services/user/homeRegister'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'

const phoneMask = (phone: string, countryCode: string): string => {
  if (!phone) return ''

  switch (countryCode) {
    case '+55': // Brasil
      return format('(XX) XXXXX-XXXX', phone)
    case '+1': // Estados Unidos
      return format('(XXX) XXX-XXXX', phone)
    case '+34': // Espanha
      return format('(XXX) XXX-XXX-XXX', phone)
    default:
      return phone
  }
}

const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '')
}

interface Country {
  name: string
  code: string
  flag: {
    image: string
    alt: string
  }
  phoneCode: string
}

const countries: Country[] = [
  {
    name: 'Brazil',
    code: 'BR',
    flag: { image: BR, alt: '' },
    phoneCode: '+55',
  },
  {
    name: 'United States',
    code: 'US',
    flag: { image: EUA, alt: '' },
    phoneCode: '+1',
  },
  {
    name: 'Espanha',
    code: 'ES',
    flag: { image: ESP, alt: '' },
    phoneCode: '+34',
  },
]

export const UserStep = () => {
  const t = useTranslations()
  const {
    backStep,
    hash,
    nextStep,
    setStatus,
    setFormStep,
    onCloseForm,
    resetFormStep,
  } = useSignupStore()

  const { setOpenHomeLoginDialog } = useHomeLoginDialogStore()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0])

  const [phoneAlreadyExists, setPhoneAlreadyExists] = useState(false)
  const [documentAlreadyExists, setDocumentAlreadyExists] = useState(false)
  const [docAndPhoneAlreadyExists, setDocAndPhoneAlreadyExists] =
    useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country)
    setIsOpen(false)
    resetField('phone')
  }

  const formLoginSchema = z.object({
    cpf: z
      .string()
      .min(1, t('Panel.Register.registerForm.userStep.errors.emptyDocument'))
      .transform((val) => val.replace(/\D/g, '')) // Remove caracteres não numéricos
      .refine(
        (val) => /^\d{11}$/.test(val), // Verifica se o CPF tem 11 dígitos
        t('Panel.Register.registerForm.userStep.errors.invalidDocumentFormat'),
      )
      .transform((val) =>
        val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
      ), // Aplica a máscara ao valor armazenado
    phone: z
      .string()
      .min(1, t('Panel.Register.registerForm.userStep.errors.emptyPhone'))
      .refine(
        (phone) => {
          switch (selectedCountry.phoneCode) {
            case '+55': // Brasil
              return /^\(\d{2}\) \d{5}-\d{4}$/.test(phone)
            case '+1': // Estados Unidos
              return /^\(\d{3}\) \d{3}-\d{4}$/.test(phone)
            case '+34': // Espanha
              return /^\(\d{3}\) \d{3}-\d{3}-\d{3}$/.test(phone)
            default:
              return true
          }
        },
        {
          message: t(
            'Panel.Register.registerForm.userStep.errors.invalidPhoneFormat',
          ),
        },
      ),
  })

  type FormLoginSchema = z.infer<typeof formLoginSchema>

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormLoginSchema>({
    resolver: zodResolver(formLoginSchema),
    mode: 'onChange',
  })

  const cpfValue = watch('cpf')
  const phoneValue = watch('phone')
  const maskedPhoneValue = phoneMask(phoneValue, selectedCountry.phoneCode)
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Remove todos os caracteres que não sejam números
    const normalizedValue = normalizePhone(event.target.value)

    // Aplica a máscara no valor normalizado
    const maskedValue = phoneMask(normalizedValue, selectedCountry.phoneCode)

    // Define o valor formatado no campo, garantindo que a validação considere a máscara
    setValue('phone', maskedValue, { shouldValidate: true })

    // Limpa os erros caso a mensagem de erro esteja visível
    if (phoneAlreadyExists || docAndPhoneAlreadyExists) {
      setPhoneAlreadyExists(false)
      clearErrors('phone')
    }
  }

  const handleCPFChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Remove todos os caracteres não numéricos do valor inserido
    const normalizedCPF = event.target.value.replace(/\D/g, '')

    // Aplica a máscara no CPF normalizado
    const maskedCPF = cpfFormatter.mask(normalizedCPF)

    // Define o valor formatado no campo de CPF, garantindo que a validação considere a máscara correta
    setValue('cpf', maskedCPF, { shouldValidate: true })

    // Limpa os erros caso a mensagem de erro esteja visível
    if (documentAlreadyExists || docAndPhoneAlreadyExists) {
      setDocumentAlreadyExists(false)
      setDocAndPhoneAlreadyExists(false)
      clearErrors('cpf')
    }
  }

  const handleSubmitUserStep = async (data: { cpf: string; phone: string }) => {
    const normalizedPhone = `${selectedCountry.phoneCode}${normalizePhone(data.phone)}`

    try {
      const response = await SendUserPersonalData({
        step: 2,
        hash,
        document: cpfFormatter.normalize(data.cpf),
        phone: normalizedPhone.replace('+', ''),
      })

      if (response?.success) {
        if (
          response.message === 'Account created' ||
          response.message === 'Personal email check'
        ) {
          setStatus(3)
        }
        nextStep()
      } else {
        setFormStep(3)
        setStatus(4)
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Existing document') {
          setDocumentAlreadyExists(true)
        } else if (error.message === 'Existing phone') {
          setPhoneAlreadyExists(true)
        } else if (error.message === 'Existing documents and phone') {
          setDocAndPhoneAlreadyExists(true)
        } else {
          setFormStep(3)
          setStatus(4)
        }
      }
    }
  }

  return (
    <form
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
        }
      }}
      onSubmit={handleSubmit(handleSubmitUserStep)}
      className="flex flex-col gap-xs mt-xm"
    >
      <p className="self-stretch text-grey-300 text-BODY-XM font-Regular mb-xs">
        {t('Panel.Register.registerForm.userStep.formLabel')}
      </p>
      <Textfield
        value={cpfFormatter.mask(cpfValue)}
        placeholder={t(
          'Panel.Register.registerForm.userStep.documentPlaceholder',
        )}
        type="text"
        inputMode="numeric"
        {...register('cpf', { onChange: handleCPFChange })}
        variant={
          errors.cpf || documentAlreadyExists || docAndPhoneAlreadyExists
            ? 'error'
            : undefined
        }
        validationMessages={
          errors.cpf?.message ? [{ message: errors.cpf.message }] : []
        }
        isDarkMode
      />

      {(documentAlreadyExists || docAndPhoneAlreadyExists) && (
        <div className="flex pr-xxm pl-xs items-start gap-xxs -mt-xxxs">
          <FiAlertCircle size={12} className="text-notify-warning-normal" />
          <p className="text-notify-warning-normal text-LABEL-L font-Medium">
            {t('Panel.Register.registerForm.userStep.errors.documentExists')}
          </p>
        </div>
      )}

      <div className="flex items-center">
        <div className={`relative w-full flex gap-xs ${!isOpen && 'h-[52px]'}`}>
          <motion.div
            animate={{ width: isOpen ? '100%' : '30%' }}
            className="flex flex-col bg-grey-800 rounded-xxs overflow-hidden transition-all"
          >
            <div
              className={`h-[42px] flex items-center gap-xs justify-between cursor-pointer ${isOpen ? 'px-s my-auto' : 'my-auto mx-auto'}`}
              onClick={toggleDropdown}
            >
              <Image
                src={selectedCountry.flag.image}
                alt={selectedCountry.flag.alt}
                width={33}
                height={25}
              />
              {!isOpen ? (
                <FiChevronRight size={15} className="text-grey-300" />
              ) : (
                <FiChevronDown size={15} className="text-grey-300" />
              )}
            </div>
            {isOpen && (
              <AnimatePresence mode="wait">
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white border-t"
                >
                  {countries.map((country) => (
                    <li
                      key={country.code}
                      className="flex items-center gap-xxs cursor-pointer px-s py-xs hover:bg-grey-700"
                      onClick={() => handleSelectCountry(country)}
                    >
                      <span className="flex items-center gap-xs">
                        <Image
                          src={country.flag.image}
                          alt={country.flag.alt}
                          width={33}
                          height={25}
                        />
                        <span className="text-grey-300">{country.name}</span>
                      </span>
                      <span className="text-grey-300">{`(${country.phoneCode})`}</span>
                    </li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            )}
          </motion.div>

          {!isOpen && (
            <Textfield
              prefixText={selectedCountry.phoneCode}
              value={maskedPhoneValue}
              inputMode="tel"
              placeholder={t(
                'Panel.Register.registerForm.userStep.phonePlaceholder',
              )}
              type="text"
              {...register('phone', { onChange: handlePhoneChange })}
              variant={
                errors.phone || phoneAlreadyExists || docAndPhoneAlreadyExists
                  ? 'error'
                  : undefined
              }
              validationMessages={
                errors.phone?.message ? [{ message: errors.phone.message }] : []
              }
              isDarkMode
            />
          )}
        </div>
      </div>
      {(phoneAlreadyExists || docAndPhoneAlreadyExists) && (
        <div className="flex ml-[80px] pr-xxm pl-xs items-start gap-xxs -mt-xxxs">
          <FiAlertCircle size={12} className="text-notify-warning-normal" />
          <p className="text-notify-warning-normal text-LABEL-L font-Medium">
            {t('Panel.Register.registerForm.userStep.errors.phoneExists')}
          </p>
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
              onClick={() => backStep()}
            >
              {t('Panel.Register.registerForm.authStep.backButtonText')}
            </Button>
            <Button
              size="lg"
              isBrandButton
              type="submit"
              disabled={isSubmitting}
            >
              {t('Panel.Register.registerForm.userStep.submitButtonText')}
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
  )
}
