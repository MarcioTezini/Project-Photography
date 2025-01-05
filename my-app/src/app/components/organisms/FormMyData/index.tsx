import React, { useEffect, useRef, useState } from 'react'
import { birthDateFormatter } from '@/bosons/formatters/birthDateFormatter'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi'
import Textfield from '@/components/atoms/Textfield'
import { useTranslations } from 'next-intl'
import { disableUser, getUserData } from '@/services/user/user'
import { homeLogout } from '@/services/auth/login'
import useDialogStore from '@/stores/DialogStore'

interface EmployeeData {
  birthdate: string
  document: string
  email: string
  name: string
  phone: string
}

interface EmployeeClient {
  name?: string
}

type FormMyDataProps = {
  setTitle: (title: string) => void
}

export function FormMyData({ setTitle }: FormMyDataProps) {
  const t = useTranslations()
  const formRef = useRef<HTMLFormElement>(null)
  const { handleCloseDialog } = useDialogStore()
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null)
  const [employeeClient, setEmployeeClient] = useState<
    EmployeeClient | undefined
  >(undefined)
  const [isDeleting, setIsDeleting] = useState(false)

  const formMyDataSchema = z.object({
    employeeName: z.string().optional(),
    employeeCPF: z.string().optional(),
    employeeEmail: z.string().optional(),
    employeeTel: z.string().optional(),
    employeeBirthdate: z.string().optional(),
  })

  type FormMyDataSchema = z.infer<typeof formMyDataSchema>

  const fetchMeData = async () => {
    try {
      const me = await getUserData()
      if (me) {
        setEmployeeClient(me?.data?.detail?.client)
        setEmployeeData(me?.data?.user)
      }
    } catch (error) {
      console.error('Error fetching me data:', error)
    }
  }

  useEffect(() => {
    fetchMeData()
  }, [])

  const {
    register,
    setValue,
    formState: { errors },
  } = useForm<FormMyDataSchema>({
    resolver: zodResolver(formMyDataSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (employeeData) {
      setValue('employeeCPF', cpfFormatter.mask(String(employeeData.document)))
      setValue('employeeName', employeeData.name)
      setValue(
        'employeeBirthdate',
        birthDateFormatter.mask(
          employeeData.birthdate.replace(
            /^(\d{4})-(\d{2})-(\d{2}).*$/,
            '$3/$2/$1',
          ),
        ),
      )
      setValue('employeeTel', phoneFormatter.mask(employeeData.phone))
      setValue('employeeEmail', employeeData.email)
    }
  }, [employeeData, setValue])

  const handleDeleteClick = () => {
    setIsDeleting(true)
    setTitle(t('Home.MyDataDialog.DeleteAccount'))
  }

  const handleDeleteConfirm = async () => {
    try {
      await disableUser()
      homeLogout()
    } catch (error) {
    } finally {
      setIsDeleting(false)
      setTitle(t('Home.MyDataDialog.MyData'))
    }
  }

  const handleCancelDelete = () => {
    setIsDeleting(false)
    setTitle(t('Home.MyDataDialog.MyData'))
  }

  return (
    <>
      {isDeleting ? (
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col gap-xm p-s text-grey-300">
            <div>
              <p>
                {t('Home.MyDataDialog.WeAt')}
                <strong className="text-fichasPay-main-400">
                  {' '}
                  {!employeeClient || !employeeClient.name
                    ? 'Fichas Pay'
                    : employeeClient.name}
                </strong>{' '}
                {t('Home.MyDataDialog.WeTake')}
              </p>
            </div>
            <div>
              <p>
                {t('Home.MyDataDialog.GeneralDataProtection')}{' '}
                <strong>{t('Home.MyDataDialog.ALL')}</strong>{' '}
                {t('Home.MyDataDialog.YourDataFrom')},
              </p>
            </div>
            <div>
              <p>
                <strong>{t('Home.MyDataDialog.Attention')}</strong>{' '}
                {t('Home.MyDataDialog.ThisProcess')}
              </p>
            </div>
            <p className="text-center">
              <strong>{t('Home.MyDataDialog.DeleteYourAccount')}</strong>
            </p>
          </div>
          <div className="flex gap-s mt-xs">
            <Button
              preIcon={<FiArrowLeft width={20} height={20} />}
              type="button"
              size="lg"
              variant="outline"
              hasShadow={false}
              className="text-[#fff!important] hover:bg-grey-800"
              width={110}
              noBorder
              noShadow
              onClick={handleCancelDelete}
            >
              {t('Home.MyDataDialog.ButtonBack')}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              size="lg"
              width={160}
              variant="outline"
              className="text-[#fff!important] hover:bg-notify-warning-light bg-notify-warning-normal"
              noBorder
              noShadow
            >
              {t('Home.MyDataDialog.IWantToDelete')}
            </Button>
          </div>
        </div>
      ) : (
        <form
          ref={formRef}
          className="grid grid-cols-1 p-xxm justify-center items-center gap-s self-stretch"
        >
          <div className="w-full">
            <div className="flex flex-col gap-xs">
              <Textfield
                placeholder={t('Home.MyDataDialog.CPFPlaceholder')}
                type="text"
                disabled
                {...register('employeeCPF')}
                variant={errors.employeeCPF && 'error'}
                validationMessages={
                  errors.employeeCPF?.message
                    ? [{ message: errors.employeeCPF.message }]
                    : []
                }
              />
              <Textfield
                placeholder={t('Home.MyDataDialog.NameUserPlaceholder')}
                type="text"
                disabled
                {...register('employeeName')}
                variant={errors.employeeName && 'error'}
                validationMessages={
                  errors.employeeName?.message
                    ? [{ message: errors.employeeName.message }]
                    : []
                }
              />
              <Textfield
                placeholder={t('Home.MyDataDialog.DateOfBirthPlaceholder')}
                type="text"
                disabled
                {...register('employeeBirthdate')}
                variant={errors.employeeBirthdate && 'error'}
                validationMessages={
                  errors.employeeBirthdate?.message
                    ? [{ message: errors.employeeBirthdate.message }]
                    : []
                }
              />
              <Textfield
                placeholder={t('Home.MyDataDialog.PhonePlaceholder')}
                type="text"
                disabled
                {...register('employeeTel')}
                variant={errors.employeeTel && 'error'}
                validationMessages={
                  errors.employeeTel?.message
                    ? [{ message: errors.employeeTel.message }]
                    : []
                }
              />
              <Textfield
                placeholder={t('Home.MyDataDialog.emailPlaceholder')}
                type="email"
                disabled
                {...register('employeeEmail')}
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
                {t('Home.MyDataDialog.ButtonBack')}
              </Button>

              <Button
                onClick={handleDeleteClick}
                addIcon={<FiTrash2 width={20} height={20} />}
                size="lg"
                width={160}
                variant="outline"
                className="text-notify-warning-normal hover:bg-grey-800"
                noBorder
                noShadow
              >
                {t('Home.MyDataDialog.DeleteAccountButton')}
              </Button>
            </div>
          </div>
        </form>
      )}
    </>
  )
}

export default FormMyData
