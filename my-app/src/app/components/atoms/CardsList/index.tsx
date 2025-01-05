import React from 'react'
import Image from 'next/image'
import { currencyWithPrefixMask } from '@/bosons/formatters/currencyWithPrefixFormatter'
import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface ValidationMessage {
  message: string
  isValid?: boolean
}

interface CardProps {
  clubId?: string
  balance?: string
  clubName?: string
  imageUrl?: string
  onIconClick?: () => void
  verified?: React.ReactNode
  playerName?: string
  appName?: string
  showClubId?: boolean
  payInfo?: boolean
  marginBottom?: string
  date?: string
  showCloseIcon?: boolean
  monetaryValue?: string
  onCloseClick?: () => void // Função de fechamento
  variant?: 'default' | 'success' | 'error' | 'info' | 'warning'
  validationMessages?: ValidationMessage[] // Adiciona mensagens de validação
  t: ReturnType<typeof useTranslations>
}

const MAX_LENGTH = 14

const Card: React.FC<CardProps> = ({
  clubId,
  clubName,
  imageUrl,
  onIconClick,
  verified,
  playerName,
  appName,
  payInfo,
  showClubId,
  marginBottom,
  date,
  balance,
  showCloseIcon,
  monetaryValue,
  onCloseClick, // Recebe a função de fechamento
  variant = 'default',
  validationMessages, // Recebe as mensagens de validação
  t,
}) => {
  if (payInfo) {
    const variantBorder = {
      default: 'border-grey-700',
      success: 'border-notify-success-normal',
      error: 'border-notify-warning-normal',
      info: 'border-notify-info-normal',
      warning: 'border-notify-alert-normal',
    }

    const variantClass = variantBorder[variant]

    return (
      <>
        <div
          className={`bg-grey-800 w-full h-auto min-w-[324px] rounded-sm border ${variantClass} ${marginBottom || ''}`}
        >
          <div className="flex justify-between items-center w-full">
            <div className="bg-gray-700 rounded-full flex items-start justify-between gap-xs overflow-hidden px-s py-[12px]">
              <div className="flex items-center mr-4">
                <div className="relative w-[52px] h-[52px] border-2 border-grey-700 bg-grey-900 rounded-xxl">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt="Club logo"
                      width={52}
                      height={52}
                      className="rounded-xl object-cover border-2 border-grey-900"
                    />
                  )}
                  <div className="absolute top-[-4px] right-0">
                    {typeof verified === 'string' ? (
                      <Image
                        src={verified}
                        alt="Icon"
                        width={16}
                        height={16}
                        className="object-cover"
                      />
                    ) : (
                      <span>{verified}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col text-left ml-xs gap-xxxs justify-center">
                <div className="inline-flex gap-xxs px-xs">
                  <div className="text-BODY-XM text-grey-300">
                    <span className="font-Bold">ID:</span>
                    <span className="ml-xs">{clubId}</span>{' '}
                  </div>
                </div>
                <div className="inline-flex gap-xxs px-xs">
                  <div className="text-BODY-XM text-grey-300">
                    <span className="font-Bold">{t('nickName')}:</span>
                    <span className="ml-xs">
                      {playerName
                        ? playerName.length > MAX_LENGTH
                          ? `${playerName.slice(0, MAX_LENGTH)}...`
                          : playerName
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="inline-flex gap-xxs px-xs">
                  <div className="text-BODY-XM text-grey-300">
                    <span className="font-Bold">{t('club')}:</span>
                    <span className="ml-xs">
                      {clubName
                        ? clubName.length > MAX_LENGTH
                          ? `${clubName.slice(0, MAX_LENGTH)}...`
                          : clubName
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="inline-flex gap-xxs px-xs">
                  <div className="text-BODY-XM text-grey-300">
                    <span className="font-Bold">{t('app')}:</span>
                    <span className="ml-xs">{appName}</span>
                  </div>
                </div>
                {balance !== null && balance !== undefined && (
                  <div className="inline-flex gap-xxs px-xs">
                    <div className="text-BODY-XM text-grey-300">
                      <span className="font-Bold">{t('currentBalance')}:</span>
                      <span className="ml-xs">{!balance ? '0' : balance}</span>
                    </div>
                  </div>
                )}
              </div>
              {showCloseIcon && (onCloseClick || onIconClick) && (
                <div className="flex items-center self-center">
                  <FiX
                    width={28}
                    height={28}
                    className="cursor-pointer text-grey-500 w-[20px] h-[20px]"
                    onClick={onCloseClick || onIconClick}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {validationMessages && validationMessages.length > 0 && (
          <div className="mt-[4px] flex flex-col gap-xxs">
            {validationMessages.map((valMsg) => (
              <p
                key={valMsg.message}
                className={`flex gap-xxs items-center text-LABEL-L font-Medium text-notify-warning-normal`}
              >
                {valMsg.isValid ? (
                  <FiCheckCircle className="w-[12px] h-[12px] text-notify-success-normal" />
                ) : (
                  <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-normal" />
                )}
                {valMsg.message}
              </p>
            ))}
          </div>
        )}
      </>
    )
  }

  const monetaryValueNumber = parseFloat(monetaryValue || '0')
  const formattedMonetaryValue =
    monetaryValueNumber < 0
      ? `- ${currencyWithPrefixMask(Math.abs(monetaryValueNumber).toString())}`
      : currencyWithPrefixMask(monetaryValueNumber.toString())

  return (
    <div
      className={`bg-grey-800 w-full ${date ? 'h-[100px]' : 'h-[84px]'} min-w-[324px] rounded-sm border border-grey-700 ${marginBottom || ''}`}
    >
      <div className="flex justify-between items-center w-full">
        <div className="bg-gray-700 rounded-full flex items-center justify-between gap-xs overflow-hidden px-s py-[12px]">
          <div className={`flex justify-between ${date ? 'items-center' : ''}`}>
            <div className="mr-4 relative w-[52px] h-[52px] border-2 border-grey-700 bg-grey-900 rounded-xxl">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Club logo"
                  width={52}
                  height={52}
                  className="rounded-xl object-cover border-2 border-grey-900"
                />
              )}
              <div className="absolute top-[-4px] right-0">
                {typeof verified === 'string' ? (
                  <Image
                    src={verified}
                    alt="Icon"
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                ) : (
                  <span>{verified}</span>
                )}
              </div>
            </div>

            <div className="flex-grow text-left ml-xs gap-xxxs">
              <div className="inline-flex gap-xxs bg-a-black-30 py-xxs px-xs justify-center rounded-sm">
                <div className="text-BODY-S text-grey-600">
                  {showClubId
                    ? 'Clube ID'
                    : playerName
                      ? playerName.length > MAX_LENGTH
                        ? `${playerName.slice(0, MAX_LENGTH)}...`
                        : playerName
                      : 'Clube ID'}
                </div>
                <div className="text-grey-400 text-BODY-S">{clubId}</div>
              </div>

              <div className="text-BODY-M font-Semibold text-[#ffffff]">
                {showClubId
                  ? 'Clube ID'
                  : clubName
                    ? clubName.length > MAX_LENGTH
                      ? `${clubName.slice(0, MAX_LENGTH)}...`
                      : clubName
                    : 'N/A'}
              </div>
              <div className="text-BODY-S text-[#ffffff]">{appName}</div>
              <div className="text-BODY-S text-[#ffffff]">{date}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="p-[12px] text-grey-500">
            {showCloseIcon
              ? (onCloseClick || onIconClick) && (
                  <FiX
                    width={28}
                    height={28}
                    className="cursor-pointer w-[20px] h-[20px]"
                    onClick={onCloseClick || onIconClick}
                  />
                )
              : formattedMonetaryValue && (
                  <span
                    className={`text-BODY-S font-Bold whitespace-nowrap ${
                      monetaryValueNumber < 0
                        ? 'text-notify-warning-normal'
                        : 'text-notify-success-normal'
                    }`}
                  >
                    {formattedMonetaryValue}
                  </span>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface CardsListProps {
  clubs: {
    id?: string
    clubName?: string
    imageUrl?: string
    onIconClick?: () => void
    verified?: React.ReactNode
    playerName?: string
    appName?: string
    date?: string
    monetaryValue?: string
    balance?: string
  }[]
  payInfo?: boolean
  showCloseIcon?: boolean
  showClubId?: boolean
  marginBottom?: string
  cardTransaction?: boolean
  onCloseClick?: () => void // Adiciona a função de fechamento ao CardsList também
  variant?: 'default' | 'success' | 'error' | 'info' | 'warning'
  validationMessages?: ValidationMessage[]
}

const CardsList: React.FC<CardsListProps> = ({
  clubs,
  showClubId,
  marginBottom,
  showCloseIcon,
  payInfo,
  onCloseClick,
  variant = 'default',
  validationMessages,
}) => {
  const t = useTranslations('Components.CardsList')

  return (
    <div className="flex flex-col space-y-4">
      {clubs.map((club) => (
        <Card
          key={club.id}
          clubId={club.id}
          clubName={club.clubName}
          playerName={club.playerName}
          imageUrl={club.imageUrl}
          appName={club.appName}
          verified={club.verified}
          showClubId={showClubId}
          marginBottom={marginBottom}
          onIconClick={club.onIconClick}
          date={club.date}
          showCloseIcon={showCloseIcon}
          monetaryValue={club.monetaryValue}
          payInfo={payInfo}
          balance={club.balance}
          onCloseClick={onCloseClick} // Passa a função ao Card
          variant={variant}
          validationMessages={validationMessages}
          t={t}
        />
      ))}
    </div>
  )
}

export default CardsList
