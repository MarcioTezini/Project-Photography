import { dateFormatterPt } from '@/bosons/dateFormatterPt'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { DialogButton } from '@/components/molecules/DialogButton'
import { ExtractInfo } from '@/services/extract/extract'
import { useTranslations } from 'next-intl'
import React, { useRef } from 'react'
import { FiCheckCircle, FiClock, FiInfo, FiX } from 'react-icons/fi'
import { useReactToPrint } from 'react-to-print'
import { getStatusTexts, TransactionStatus } from './info'

interface IOperationStatus {
  operation?: ExtractInfo
  onClose?: () => void
}

interface Info {
  title: string
  fields?: {
    fieldName?: string
    icon?: React.ReactNode
    value?: string | number
  }[]
  logs?: {
    code: number
    status: string
    text: string
  }[]
}

export const OperationStatus: React.FC<IOperationStatus> = ({
  operation,
  onClose,
}) => {
  const t = useTranslations()
  const componentRef = useRef(null)

  const handleOperationLog = (status: string) => {
    switch (status) {
      case 'success': {
        return <FiCheckCircle className="text-notify-success-normal" />
      }
      case 'pending': {
        return <FiClock className="text-notify-alert-normal" />
      }
      case 'info': {
        return <FiInfo className="text-notify-info-normal" />
      }
      default: {
        return <FiX className="text-notify-warning-normal" />
      }
    }
  }

  const info: Info[] = [
    {
      title: t(
        'Panel.Extract.dialogTransactionDetails.sections.applicationData.title',
      ),
      fields: [
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.applicationData.properties.0',
          ),
          value: operation?.id,
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.applicationData.properties.1',
          ),
          value: dateFormatterPt.mask(operation?.date),
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.applicationData.properties.2',
          ),
          value: operation?.player.app,
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.applicationData.properties.3',
          ),
          value: `${operation?.player.club} (${operation?.player.clubId})`,
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.applicationData.properties.4',
          ),
          value: `${operation?.player.player} (${operation?.player.playerId})`,
        },
      ],
    },
    {
      title: t(
        'Panel.Extract.dialogTransactionDetails.sections.clientData.title',
      ),
      fields: [
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.clientData.properties.0',
          ),
          value: operation?.client.name,
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.clientData.properties.1',
          ),
          value: operation?.client.birthdate,
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.clientData.properties.2',
          ),
          value: cpfFormatter.mask(operation?.client.document),
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.clientData.properties.3',
          ),
          value: operation?.client.phone,
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.clientData.properties.4',
          ),
          value: operation?.client.email,
        },
      ],
    },
    {
      title: t(
        'Panel.Extract.dialogTransactionDetails.sections.withdrawalBankData.title',
      ),
      fields: [
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.withdrawalBankData.properties.0',
          ),
          value: operation?.bank.key,
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.withdrawalBankData.properties.1',
          ),
          value: operation?.bank.name,
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.withdrawalBankData.properties.2',
          ),
          value: operation?.bank.ag,
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.withdrawalBankData.properties.3',
          ),
          value: operation?.bank.cc,
        },
        {
          fieldName: t(
            'Panel.Extract.dialogTransactionDetails.sections.withdrawalBankData.properties.4',
          ),
          value: `R$ ${Math.abs(operation?.amount ?? 0).toLocaleString(
            'pt-BR',
            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
          )}`,
        },
      ],
    },
    {
      title: t(
        'Panel.Extract.dialogTransactionDetails.sections.operationStatus.title',
      ),
      logs: operation?.logs,
    },
  ]

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  })

  const statusTexts = getStatusTexts(t)

  return (
    <div className="pb-xl">
      <div ref={componentRef} className="">
        {info.map((item) => (
          <div
            key={item.title}
            className="w-full max-w-[328px] mx-auto text-BODY-S"
          >
            <div className="flex items-center gap-xs mt-xm">
              <span className="w-screen max-w-max text-BODY-S font-Regular text-grey-500">
                {item.title}
              </span>
              <hr className="mt-1 border-t-1 border-grey-500 w-full" />
            </div>

            {item?.fields && item.fields.length > 0 && (
              <div className="mt-s flex flex-col gap-xs">
                {item.fields?.map((info) => (
                  <div
                    key={info.fieldName}
                    className="flex items-center gap-xs overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    <strong>{info.fieldName}</strong>
                    <span className="truncate">{info.value}</span>
                  </div>
                ))}
              </div>
            )}
            {item?.logs && item.logs.length > 0 && (
              <div className="mt-s flex flex-col gap-xs">
                {item.logs?.map((log) => {
                  return (
                    <div key={log.code} className="flex items-center gap-xs">
                      {handleOperationLog(log.status)}{' '}
                      {
                        statusTexts[log.code as keyof typeof statusTexts]?.[
                          log.status as TransactionStatus
                        ]
                      }
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-xm">
        <DialogButton
          buttonName={t('Panel.Extract.dialogTransactionDetails.buttonPrimary')}
          primary={{
            size: 'lg',
            onClick: handlePrint,
          }}
          secondary={{
            variant: 'text',
            size: 'lg',
            onClick: onClose,
          }}
        />
      </div>
    </div>
  )
}
