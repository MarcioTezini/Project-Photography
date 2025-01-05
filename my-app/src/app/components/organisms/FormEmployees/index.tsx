import { useEffect, useState } from 'react'
import Button from '@/components/atoms/Button'
import Textfield from '@/components/atoms/Textfield'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { showToast } from '@/components/atoms/Toast'
import { useTranslations } from 'next-intl'
import { FiArrowLeft, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import Selector from '@/components/atoms/Select'
import { useMe } from '@/stores/Me'
import Checkbox from '@/components/atoms/Checkbox'
import { addEmployee } from '@/services/employees/employees'

interface FormEmployeeProps {
  setOpenAddPlayerDialog: (open: boolean) => void
  handleClose: () => void
  refreshData: () => void
  clubPlanId: number
}

interface Roles {
  value: string
  label: string
}

export function FormEmployee({
  setOpenAddPlayerDialog,
  handleClose,
  refreshData,
  clubPlanId,
}: Readonly<FormEmployeeProps>) {
  const t = useTranslations()
  const { me } = useMe()
  const links = me?.menu

  const [employeeRole] = useState<Roles[]>([
    { value: '1', label: t('Panel.Employees.role.1') },
    { value: '0', label: t('Panel.Employees.role.0') },
  ])
  const [selectedCheckboxIds, setSelectedCheckboxIds] = useState<
    [number, number][]
  >([])
  const [expandedLinks, setExpandedLinks] = useState<number[]>([])

  const {
    setOnSubmit,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    setIsSaveChangesDialogOpen,
  } = useSaveChangesDialogStore()

  const formEmployeeSchema = z.object({
    name: z
      .string()
      .min(1, t('Panel.Employees.nameError'))
      .regex(/^[A-zÀ-ú '´]+$/, t('Panel.Employees.onlyLettersError')),
    email: z.string().email(t('Panel.Employees.emailError')),
    employeeRole: z.string().optional(),
  })

  type FormEmployeeSchema = z.infer<typeof formEmployeeSchema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormEmployeeSchema>({
    resolver: zodResolver(formEmployeeSchema),
    mode: 'onChange',
  })

  const emailValue = watch('email')
  const nameValue = watch('name')
  const employeeRoleValue = watch('employeeRole')
  const isRegisterButtonDisabled =
    !isValid ||
    isSubmitting ||
    !employeeRoleValue ||
    (employeeRoleValue === '0' && selectedCheckboxIds.length === 0)

  useEffect(() => {
    if (
      isValid &&
      nameValue !== undefined &&
      emailValue !== undefined &&
      employeeRoleValue !== undefined
    ) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(handleFormEmployee)())
    } else {
      setHasUnsavedChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, employeeRoleValue, handleSubmit])

  useEffect(() => {
    if (!hasUnsavedChanges && isSubmitting) {
      setIsSaveChangesDialogOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges, isSubmitting])

  useEffect(() => {
    if (employeeRoleValue === '0' && selectedCheckboxIds.length === 0) {
      setHasUnsavedChanges(false)
    }
    if (emailValue !== undefined && employeeRoleValue === '1') {
      setHasUnsavedChanges(true)
    }
    if (nameValue !== undefined && employeeRoleValue === '1') {
      setHasUnsavedChanges(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeRoleValue, selectedCheckboxIds])

  useEffect(() => {
    if (
      nameValue === undefined ||
      emailValue === undefined ||
      (typeof emailValue === 'string' &&
        typeof nameValue === 'string' &&
        nameValue.length === 0 &&
        emailValue.length === 0) ||
      employeeRoleValue === undefined
    ) {
      setHasUnsavedChanges(false)
    } else {
      if (selectedCheckboxIds.length > 0) {
        setHasUnsavedChanges(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue, emailValue, employeeRoleValue, selectedCheckboxIds])

  const toggleLinkExpansion = (index: number) => {
    if (expandedLinks.includes(index)) {
      setExpandedLinks(expandedLinks.filter((i) => i !== index))
    } else {
      setExpandedLinks([...expandedLinks, index])
    }
  }

  const renderChevrons = (index: number) => {
    if (links && links.length > 0) {
      if (expandedLinks.includes(index)) {
        return <FiChevronDown size={24} className="text-fichasPay-main-400" />
      }
      return <FiChevronUp size={24} />
    }
    return <></>
  }

  const handleCheckboxChange = (root: number, id: number) => {
    setSelectedCheckboxIds((prev) => {
      const existsInArray = prev.some(([r, i]) => r === root && i === id)

      if (existsInArray) {
        return prev.filter(([r, i]) => r !== root || i !== id)
      } else {
        return [...prev, [root, id]]
      }
    })
  }

  async function handleFormEmployee(data: FormEmployeeSchema) {
    try {
      const combinedIds = selectedCheckboxIds.flat()
      const uniqueIds = Array.from(new Set(combinedIds))
      // IDs fixos que não aparecem no menu para cadastrar
      // 1 -> Home, 33 -> Meu Dados, 34 -> Alterar Senha, 55 -> Meu Dados, 56 -> Alterar Senha
      if (data.employeeRole === '0') {
        uniqueIds.push(1, 33, 34, 55, 56)
      }

      const params = {
        name: data.name,
        email: data.email,
        function: data.employeeRole,
        perms: data.employeeRole === '1' ? [] : uniqueIds,
      }
      const response = await addEmployee(params)

      if (response.status !== 200) {
        throw new Error('Failed to create employee')
      }

      showToast(
        'success',
        t('Panel.Employees.successMessage'),
        5000,
        'bottom-left',
      )

      refreshData()
      setHasUnsavedChanges(false)
      setOpenAddPlayerDialog(false)
      handleClose()
    } catch (error) {
      if (error instanceof Error) {
        showToast('error', t(`Errors.${error.message}`), 5000, 'bottom-left')
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormEmployee)}
      className="grid grid-cols-1 pt-xm sm:px-xs px-s pb-m justify-center items-center gap-xm self-stretch min-w-[328px] md:w-[328px] lg:w-[328px] m-auto"
    >
      <div>
        <div className="mb-s">
          <Textfield
            value={nameValue}
            placeholder={t('Panel.Employees.namePlaceholder')}
            {...register('name')}
            variant={errors.name && 'error'}
            validationMessages={
              errors.name?.message ? [{ message: errors.name.message }] : []
            }
          />
        </div>
        <div className="mb-s">
          <Textfield
            value={emailValue}
            placeholder={t('Panel.Employees.emailPlaceholder')}
            {...register('email')}
            variant={errors.email && 'error'}
            validationMessages={
              errors.email?.message ? [{ message: errors.email.message }] : []
            }
          />
        </div>
        <div>
          <Selector
            placeholder={t('Panel.Employees.function')}
            {...register('employeeRole')}
            value={employeeRoleValue ?? ''}
            onChange={async (value) => {
              setValue('employeeRole', value)
            }}
            options={employeeRole}
          />
        </div>
      </div>
      <div className="gap-s">
        {employeeRoleValue === '0' &&
          links.map((link, index) => {
            const isRelevantLink = [1, 33, 34, 55, 56].includes(link.id)

            if (link.id === 22 && clubPlanId === 1) {
              return null
            } else {
              if (!isRelevantLink) {
                const isExpanded = expandedLinks.includes(index)

                if (link.dropdownItems.length > 0) {
                  return (
                    <div key={link.id}>
                      <div
                        className="flex justify-between"
                        onClick={() => toggleLinkExpansion(index)}
                      >
                        <span className="text-grey-800">{link.name}</span>
                        {renderChevrons(index)}
                      </div>

                      {isExpanded && link.dropdownItems.length > 0 && (
                        <div className="gap-xs mt-s">
                          {link.dropdownItems.map((item) => {
                            if (
                              item.name === 'Gerenciar Contas' &&
                              clubPlanId === 1
                            ) {
                              return null
                            } else {
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-xs my-xs"
                                >
                                  <Checkbox
                                    onChange={() =>
                                      handleCheckboxChange(item.root, item.id)
                                    }
                                    checked={selectedCheckboxIds.some(
                                      ([r, i]) =>
                                        r === item.root && i === item.id,
                                    )}
                                  />
                                  <label className="text-grey-900 text-BODY-XM font-Medium">
                                    {item.name}
                                  </label>
                                </div>
                              )
                            }
                          })}
                        </div>
                      )}
                      <hr className="my-s text-grey-500"></hr>
                    </div>
                  )
                }

                return (
                  <div key={link.id}>
                    <div key={link.id} className="flex items-center gap-xs">
                      <Checkbox
                        onChange={() =>
                          handleCheckboxChange(link.root, link.id)
                        }
                        checked={selectedCheckboxIds.some(
                          ([r, i]) => r === link.root && i === link.id,
                        )}
                      />
                      <label className="text-grey-900 text-BODY-XM font-Medium">
                        {link.name}
                      </label>
                    </div>
                    <hr className="my-s text-grey-500"></hr>
                  </div>
                )
              }
            }
            return null
          })}
      </div>
      <div className="flex items-center gap-s justify-center mb-xxxm mt-m ">
        <Button
          variant="text"
          width={110}
          size="lg"
          preIcon={<FiArrowLeft width={20} height={20} />}
          onClick={(e) => {
            e.preventDefault()
            handleClose()
          }}
        >
          {t('Panel.Employees.buttonBack')}
        </Button>
        <Button width={180} size="lg" disabled={isRegisterButtonDisabled}>
          {t('Panel.Employees.register')}
        </Button>
      </div>
    </form>
  )
}
