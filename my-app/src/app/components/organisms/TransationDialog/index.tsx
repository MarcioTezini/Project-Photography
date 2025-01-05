import React, { useEffect, useState } from 'react'
import Dialog from '@/components/molecules/Dialog'
import CardsList from '@/components/atoms/CardsList'
import { FiArrowLeft, FiLoader } from 'react-icons/fi'
import Button from '@/components/atoms/Button'
import { useTranslations } from 'next-intl'
import useTransationDialogStore from '@/stores/TransationDialog'
import {
  getTransactionsList,
  TransactionHomeParams,
} from '@/services/transactions/transactions'
import { showToast } from '@/components/atoms/Toast'
import { reformatDate } from '@/bosons/formatters/reformatDate'

interface CardData {
  playerName?: string
  clubName?: string
  monetaryValue?: string
  appName?: string
  imageUrl?: string
  date?: string
  CloseIcon?: React.ReactNode
  icon?: React.ReactNode
}

const TransitionDialog = () => {
  const t = useTranslations()
  const { openTransationDialog, handleCloseTransationDialog } =
    useTransationDialogStore()
  const [isLoadingLinks, setIsLoadingLinks] = useState(false)

  const [clubs, setClubs] = useState<CardData[]>([])

  useEffect(() => {
    const fetchLinkNewAccountInfo = async () => {
      setIsLoadingLinks(true)
      try {
        const response = await getTransactionsList({
          requestdate: '',
        })

        if (response && Array.isArray(response.data)) {
          const clubData: CardData[] = response.data.map(
            (transaction: TransactionHomeParams) => {
              const transactionDate = transaction.requestdate
                ? new Date(reformatDate(transaction.requestdate))
                : null

              if (transactionDate) {
                transactionDate.setHours(transactionDate.getHours() - 3)
              }
              const formattedDate = transactionDate
                ? transactionDate.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : 'Data inválida'

              return {
                playerName: transaction.Nick,
                clubName: transaction.Clube,
                monetaryValue: (Number(transaction.value) * 100).toFixed(2),
                appName: transaction.appname,
                imageUrl: transaction.logo,
                date: formattedDate,
              }
            },
          )

          setClubs(clubData)
        } else {
          console.error('Erro ao buscar dados da API:', response)
        }
        setIsLoadingLinks(false)
      } catch (error) {
        setIsLoadingLinks(false)
        if (error instanceof Error) {
          if (error.message === 'response.map is not a function') {
            showToast('error', 'Não há transações', 5000, 'bottom-left')
          } else {
            showToast('error', `${error.message}`, 5000, 'bottom-left')
          }
        }
      }
    }

    fetchLinkNewAccountInfo()
  }, [])

  return (
    <>
      <Dialog
        position="aside"
        title={t('Home.transactionHistory.transaction')}
        open={openTransationDialog}
        onClose={handleCloseTransationDialog}
        className="w-[531px] !xs:w-[343px]"
        isDarkMode
      >
        {isLoadingLinks ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <FiLoader className="animate-spin text-H3 text-grey-500" />
          </div>
        ) : (
          <div className="w-[360px] m-auto pt-xm">
            <CardsList
              clubs={clubs}
              showClubId={false}
              marginBottom="mb-s"
              cardTransaction={true}
            />
            <div className="mb-l flex justify-center items-center">
              <Button
                preIcon={<FiArrowLeft width={20} height={20} />}
                type="button"
                size="lg"
                variant="text"
                width={110}
                onClick={handleCloseTransationDialog}
                isBrandButton
              >
                {t('Panel.Account.FormAccount.buttonBack')}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}

export default TransitionDialog
