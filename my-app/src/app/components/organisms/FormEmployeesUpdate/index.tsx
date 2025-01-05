import React, { useCallback, useEffect, useState } from 'react'
import Button from '@/components/atoms/Button'
import Textfield from '@/components/atoms/Textfield'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { showToast } from '@/components/atoms/Toast'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useTranslations } from 'next-intl'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import Selector from '@/components/atoms/Select'
import { useMe } from '@/stores/Me'
import Checkbox from '@/components/atoms/Checkbox'
import {
  getEmployeeInfo,
  updateEmployees,
} from '@/services/employees/employees'
import Switch from '@/components/atoms/Switch'
import { Tooltip } from '@/components/atoms/Tooltip'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'

interface FormEmployeeUpdateProps {
  setOpenUpdateEmployeeDialog: (open: boolean) => void
  onClose: () => void
  refreshData: () => void
  id: number | null
  clubPlanId: number
}

interface Roles {
  value: string
  label: string
}

type Item = {
  id: number
  root: number
  dropdownItems: Item[]
}

export function FormEmployeeUpdate({
  setOpenUpdateEmployeeDialog,
  onClose,
  id,
  refreshData,
  clubPlanId,
}: Readonly<FormEmployeeUpdateProps>) {
  const t = useTranslations()
  const { me } = useMe()
  const links = me?.menu
  // IDs fixos que não aparecem no menu para cadastrar
  // 1 -> Home, 33 -> Meu Dados, 34 -> Alterar Senha, 55 -> Meu Dados, 56 -> Alterar Senha
  const fixedIds = [1, 33, 34, 55, 56]

  const [employeeRole] = useState<Roles[]>([
    { value: '1', label: t('Panel.Employees.role.1') },
    { value: '0', label: t('Panel.Employees.role.0') },
  ])
  const [selectedCheckboxIdsUpdate, setSelectedCheckboxIdsUpdate] = useState<
    [number, number][]
  >([])
  const [expandedLinks, setExpandedLinks] = useState<number[]>([])
  const [status, setStatus] = useState<boolean>(false)
  const [isChanged, setIsChanged] = useState(false)
  const [initialValues, setInitialValues] = useState({
    employeeRole: '',
    statusUpdate: '',
    selectedCheckboxes: '',
  })

  const {
    setOnSubmit,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    setIsSaveChangesDialogOpen,
  } = useSaveChangesDialogStore()

  const formEmployeeSchema = z.object({
    emailUpdate: z.string().optional(),
    employeeRole: z.string().optional(),
    nameUpdate: z.string().optional(),
    cpf: z.string().optional(),
    phone: z.string().optional(),
    statusUpdate: z.string().min(1),
  })

  type FormEmployeeUpdateSchema = z.infer<typeof formEmployeeSchema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormEmployeeUpdateSchema>({
    resolver: zodResolver(formEmployeeSchema),
    mode: 'onChange',
  })

  const emailUpdatedValue = watch('emailUpdate')
  const nameValue = watch('nameUpdate')
  const cpfValue = watch('cpf')
  const phoneValue = watch('phone')
  const employeeRoleUpdateValue = watch('employeeRole')
  watch('statusUpdate')
  const isRegisterButtonDisabled =
    !isChanged ||
    isSubmitting ||
    (employeeRoleUpdateValue === '0' && selectedCheckboxIdsUpdate.length === 0)

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

  // Função que retorna o objeto composto com root e id, comparando com o array de números
  const combineObjectsWithArray = (
    items: Item[],
    idsArray: number[],
  ): { [key: number]: { root: number; id: number } } => {
    const resultado: { [key: number]: { root: number; id: number } } = {}

    items.forEach((item) => {
      // Verifica se o id do item existe no array de números
      if (idsArray.includes(item.id)) {
        // Se o item já existir no resultado, combine os valores de root e id
        if (resultado[item.id]) {
          resultado[item.id] = {
            root: resultado[item.id].root + item.root,
            id: item.id,
          }
        } else {
          // Caso contrário, adicione o item ao resultado
          resultado[item.id] = { root: item.root, id: item.id }
        }
      }

      // Verifica se há dropdownItems e percorre recursivamente
      if (item.dropdownItems.length > 0) {
        const itensDropdown = combineObjectsWithArray(
          item.dropdownItems,
          idsArray,
        )
        Object.keys(itensDropdown).forEach((key) => {
          const dropdownId = Number(key)
          if (resultado[dropdownId]) {
            resultado[dropdownId] = {
              root: resultado[dropdownId].root + itensDropdown[dropdownId].root,
              id: dropdownId,
            }
          } else {
            resultado[dropdownId] = itensDropdown[dropdownId]
          }
        })
      }
    })

    // Remove itens cujo root seja igual a 0
    Object.keys(resultado).forEach((key) => {
      const id = Number(key)
      if (resultado[id].root === 0 && id !== 36) {
        delete resultado[id]
      }
    })

    return resultado
  }

  const handleCheckboxChange = (root: number, id: number) => {
    setSelectedCheckboxIdsUpdate((prev) => {
      const existsInArray = prev.some(([r, i]) => r === root && i === id)

      if (existsInArray) {
        return prev.filter(([r, i]) => !(r === root && i === id))
      } else {
        return [...prev, [root, id]]
      }
    })
  }

  const removeDuplicates = (array: number[]): number[] => {
    return [...new Set(array)]
  }

  const ordenarArrayCrescente = (array: number[]): number[] => {
    return array.sort((a, b) => a - b)
  }

  useEffect(() => {
    const fetchEmployeeUpdateInfo = async () => {
      if (id !== null) {
        try {
          const response = await getEmployeeInfo(id)
          const employeeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data
          const statusUpdateValue = employeeData.status
          const employeeRoleUpdateValue = employeeData.permission
          const permsArray = employeeData.perms || []
          const filteredPermsArray = permsArray.filter(
            (id) => ![1, 33, 34, 55, 56].includes(id),
          )
          const combinedArray = combineObjectsWithArray(
            me.menu,
            filteredPermsArray,
          )

          setSelectedCheckboxIdsUpdate(
            Object.entries(combinedArray).map(([id, { root }]) => [
              root,
              Number(id),
            ]),
          )

          if (employeeData) {
            setValue('emailUpdate', employeeData.email?.toString() || '')
            setValue(
              'cpf',
              cpfFormatter.mask(employeeData.document?.toString() || ''),
            )
            setValue('nameUpdate', employeeData.name?.toString() || '')
            setValue(
              'phone',
              phoneFormatter.mask(employeeData.phone?.toString() || ''),
            )
            setStatus(employeeData.status === 1)
            setValue('statusUpdate', statusUpdateValue?.toString() || '')
            setValue('employeeRole', employeeRoleUpdateValue?.toString() || '')
            setInitialValues({
              employeeRole: employeeRoleUpdateValue?.toString() || '',
              statusUpdate: statusUpdateValue?.toString() || '',
              selectedCheckboxes: filteredPermsArray.toString() || '',
            })
          }

          const initialExpanded = links.reduce<number[]>((acc, link, idx) => {
            const hasCheckedItems = link.dropdownItems.some((item) =>
              permsArray.includes(item.id),
            )
            if (hasCheckedItems) {
              acc.push(idx)
            }
            return acc
          }, [])
          setExpandedLinks(initialExpanded)
        } catch (error) {
          if (error instanceof Error) {
            showToast('error', `${error.message}`, 5000, 'bottom-left')
          }
        }
      }
    }

    fetchEmployeeUpdateInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setValue])

  useEffect(() => {
    const stringIds = selectedCheckboxIdsUpdate.toString()
    const arrayIds = stringIds.split(',').map(Number)
    const removingDuplicates = removeDuplicates(arrayIds)
    const sortedArray = ordenarArrayCrescente(removingDuplicates)
    const sortedAndNoDuplicatesString = sortedArray.toString()

    const currentValues = {
      employeeRole: employeeRoleUpdateValue,
      statusUpdate: status ? '1' : '0',
      selectedCheckboxes:
        sortedAndNoDuplicatesString === '0' ? '' : sortedAndNoDuplicatesString,
    }

    if (
      currentValues.employeeRole === '0' &&
      currentValues.selectedCheckboxes === ''
    ) {
      setIsChanged(false)
    } else {
      setIsChanged(
        JSON.stringify(initialValues) !== JSON.stringify(currentValues),
      )
    }
  }, [
    employeeRoleUpdateValue,
    initialValues,
    status,
    selectedCheckboxIdsUpdate,
  ])

  const handlePermissionsChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = event.target.checked
    setStatus(isChecked)
    setValue('statusUpdate', isChecked ? '1' : '0')
  }

  const handleFormEmployeeUpdate = useCallback(
    async (data: FormEmployeeUpdateSchema) => {
      try {
        const filteredResult = selectedCheckboxIdsUpdate.filter(
          ([root, id]) => !(root === 0 && id !== 1 && id !== 36),
        )
        const combinedIds = filteredResult.flat()
        const uniqueIds = Array.from(new Set([...combinedIds, ...fixedIds]))
        const permsByRole = data.employeeRole === '1' ? [] : uniqueIds

        await updateEmployees({
          id: Number(id),
          perms: permsByRole,
          status: Number(data.statusUpdate),
          function: String(data.employeeRole),
        })
        showToast(
          'success',
          t('Panel.Whitelist.FormWhitelist.agentUpdate'),
          5000,
          'bottom-left',
        )
        refreshData()
        setHasUnsavedChanges(false)
        setOpenUpdateEmployeeDialog(false)
        onClose()
      } catch (error) {
        if (error instanceof Error) {
          showToast('error', t(`Errors.${error.message}`), 5000, 'bottom-left')
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, status, selectedCheckboxIdsUpdate, t, refreshData],
  )

  useEffect(() => {
    if (isChanged) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(handleFormEmployeeUpdate)())
    } else {
      setHasUnsavedChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChanged, handleSubmit])

  useEffect(() => {
    if (!hasUnsavedChanges && isSubmitting) {
      setIsSaveChangesDialogOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges, isSubmitting])

  return (
    <form
      onSubmit={handleSubmit(handleFormEmployeeUpdate)}
      className="grid grid-cols-1 pt-xm px-xs pb-m justify-center items-center gap-xs self-stretch min-w-[328px] md:w-[328px] lg:w-[328px] m-auto"
    >
      <div className="mb-s">
        <div className="mb-[13px]">
          <Textfield
            type="text"
            disabled
            value={nameValue}
            placeholder={t('Panel.customer.editForm.fullNamePlaceholder')}
            {...register('nameUpdate')}
            variant={errors.nameUpdate && 'error'}
            validationMessages={
              errors.nameUpdate?.message
                ? [{ message: errors.nameUpdate.message }]
                : []
            }
          />
        </div>
        <div className="mb-[13px]">
          <Textfield
            type="text"
            disabled
            value={cpfValue}
            placeholder={t('Panel.customer.editForm.documentIdPlaceholder')}
            {...register('cpf')}
            variant={errors.cpf && 'error'}
            validationMessages={
              errors.cpf?.message ? [{ message: errors.cpf.message }] : []
            }
          />
        </div>
        <div className="mb-[13px]">
          <Textfield
            type="text"
            disabled
            value={emailUpdatedValue}
            placeholder={t('Panel.Employees.emailPlaceholder')}
            {...register('emailUpdate')}
            variant={errors.emailUpdate && 'error'}
            validationMessages={
              errors.emailUpdate?.message
                ? [{ message: errors.emailUpdate.message }]
                : []
            }
          />
        </div>
        <div className="mb-[13px]">
          <Textfield
            type="text"
            disabled
            value={phoneValue}
            placeholder={t('Panel.MySignature.phonePlaceholder')}
            {...register('phone')}
            variant={errors.phone && 'error'}
            validationMessages={
              errors.phone?.message ? [{ message: errors.phone.message }] : []
            }
          />
        </div>
        <div>
          <Selector
            placeholder={t('Panel.Employees.function')}
            {...register('employeeRole')}
            value={employeeRoleUpdateValue ?? ''}
            onChange={async (value) => {
              setValue('employeeRole', value)
            }}
            options={employeeRole}
          />
        </div>
      </div>

      {employeeRoleUpdateValue === '0' &&
        links.map((link, index) => {
          const isRelevantLink = fixedIds.includes(link.id)

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
                                className="flex items-center gap-xs my-s"
                              >
                                <Checkbox
                                  onChange={() =>
                                    handleCheckboxChange(item.root, item.id)
                                  }
                                  checked={selectedCheckboxIdsUpdate.some(
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
                      onChange={() => handleCheckboxChange(link.root, link.id)}
                      checked={selectedCheckboxIdsUpdate.some(
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

      <div className="flex justify-between min-w-full gap-xs mt-[13px]">
        <div className="flex gap-xxs">
          <p className="text-BODY-XM text-grey-700">{'Status'}</p>
          <TooltipPrimitive.Provider delayDuration={0}>
            <Tooltip
              content={<p>{t('Panel.Employees.infoTolltip')}</p>}
              defaultOpen={false}
              contentMarginLeft="90px"
            >
              <FiAlertCircle className="w-6 h-6 cursor-pointer" />
            </Tooltip>
          </TooltipPrimitive.Provider>
        </div>
        <div>
          <Switch
            checked={status}
            onChange={handlePermissionsChange}
            id="statusUpdate"
          />
        </div>
      </div>
      <hr className="text-grey-500 " />

      <div className="flex items-center gap-s justify-center mb-xxxm mt-m ">
        <Button
          variant="text"
          width={110}
          size="lg"
          preIcon={<FiArrowLeft width={20} height={20} />}
          onClick={(e) => {
            e.preventDefault()
            onClose()
          }}
        >
          {t('Panel.Employees.buttonBack')}
        </Button>
        <Button width={180} size="lg" disabled={isRegisterButtonDisabled}>
          {t('Panel.MyData.MyDataForm.submitButtonText')}
        </Button>
      </div>
    </form>
  )
}
