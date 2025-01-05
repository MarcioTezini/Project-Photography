/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { PanelTemplate } from '@/components/templates/PanelTemplate'
import { FiArrowRight, FiClipboard, FiGrid, FiPieChart } from 'react-icons/fi'
import { PiHandDeposit, PiHandWithdraw } from 'react-icons/pi'
import { LiaWalletSolid } from 'react-icons/lia'
import DashboardFilter from '@/components/molecules/DashboardFilter'
import DashboardInfoCard from '@/components/molecules/DashboardInfoCard'
import Divider from '@/components/atoms/Divider'
import { TableDashboard } from '@/components/organisms/TableDashboard'
import {
  getLastTransactions,
  getTransactionInfoParams,
  getTransactionsInfo,
  Transaction,
  TransactionInfo,
} from '@/services/transactions/transactions'
import { useTranslations } from 'next-intl'
import { getBalance } from '@/services/balances/balances'
import { getLinks, getLinksParams, LinksData } from '@/services/links/links'
import { useClientStore } from '@/stores/ClientStore'
import Button from '@/components/atoms/Button'
import { useDebounce } from '@/hooks/useDebounce'
import Link from 'next/link'

const DashboardTemplate = () => {
  const t = useTranslations('Panel.Dashboard')

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState<string>('0,00')
  const [linksData, setLinksData] = useState<LinksData | null>(null)
  const [transactionInfo, setTransactionInfo] =
    useState<TransactionInfo | null>(null)

  const [initialDate, setInitialDate] = useState<string | null>(null)
  const [finalDate, setFinalDate] = useState<string | null>(null)
  const { selectedClient } = useClientStore()

  const getInitialLastTransactionsData = async () => {
    loadTransactions()
  }

  const loadLastTransactionsWithDebounce = useDebounce(
    () => getInitialLastTransactionsData(),
    1000,
  )

  const fetchLinksData = async () => {
    try {
      if (initialDate && finalDate) {
        const params: getLinksParams = {
          dateStart: initialDate,
          dateEnd: finalDate,
        }
        const { data } = await getLinks(params)
        setLinksData(data)
      } else {
        console.error('Initial date or final date is null')
      }
    } catch (error) {
      console.error('Failed to fetch links data:', error)
    }
  }

  const fetchTransactionInfo = async () => {
    try {
      if (initialDate && finalDate) {
        const params: getTransactionInfoParams = {
          dateStart: initialDate,
          dateEnd: finalDate,
        }
        const { data } = await getTransactionsInfo(params)
        setTransactionInfo(data)
      } else {
        console.error('Initial date or final date is null')
      }
    } catch (error) {
      console.error('Failed to fetch transaction info:', error)
    }
  }

  const fetchBalance = async () => {
    try {
      const { data } = await getBalance()
      const formattedBalance = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(data.balances?.[0]?.balance)
      setBalance(formattedBalance)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }

  const fetchLinksDataDebounced = useDebounce(fetchLinksData, 1000)
  const fetchTransactionInfoDebounced = useDebounce(fetchTransactionInfo, 1000)
  const fetchBalanceDebounced = useDebounce(fetchBalance, 1000)

  useEffect(() => {
    fetchBalanceDebounced()
  }, [selectedClient])

  useEffect(() => {
    fetchLinksDataDebounced()
    fetchTransactionInfoDebounced()
  }, [initialDate, finalDate, selectedClient])

  const handleDateChange = (startDate: string, endDate: string) => {
    setInitialDate(startDate)
    setFinalDate(endDate)
  }

  const loadTransactions = useCallback(async () => {
    const transactions = await getLastTransactions({})
    setTransactions(transactions?.data.last)
    return transactions?.data
  }, [])

  useEffect(() => {
    loadLastTransactionsWithDebounce()
  }, [selectedClient])

  return (
    <PanelTemplate
      title={t('title')}
      icon={<FiGrid className="h-m w-m" />}
      headerContent={<></>}
    >
      <div className="sm:flex sm:flex-col lg:grid lg:grid-cols-[2fr,1fr] gap-s content-center items-start self-stretch rounded-sm bg-grey-300 shadow-DShadow-Special-X">
        <div className="flex flex-col gap-s w-full">
          {/* Saldo e Últimas Transações */}
          <div className="p-s flex flex-col items-center gap-xm rounded-sm bg-grey-300 shadow-DShadow-Special-X ">
            <div className="flex flex-col justify-center items-start gap-xm self-stretch">
              <div className="flex justify-between items-start self-stretch">
                <div className="flex flex-col items-start gap-xxs">
                  <h1 className="text-grey-900 text-H5 font-Regular">
                    {t('balance')}
                  </h1>
                  <h1 className="text-grey-600 text-BODY-S font-Medium">
                    {t('wallet')}
                  </h1>
                </div>
                <LiaWalletSolid className="w-xm h-xm text-fichasPay-main-400" />
              </div>
              <div className="flex items-center gap-s border-b-[0.5px] border-grey-600 w-full pb-xm">
                <h1 className="text-grey-900 text-H6 font-Regular">
                  {balance !== '0,00' &&
                    (balance.includes('-')
                      ? balance.slice(0, 3)
                      : balance.slice(0, 2))}
                </h1>
                <h1 className="text-grey-900 text-H3 font-Regular">
                  {balance.trim() !== '0,00' && balance.slice(3).trim()}
                </h1>
              </div>
            </div>
            <div className="flex flex-col justify-center items-end gap-s self-stretch">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-grey-900 text-H6 font-Regular">
                  {t('recentTransactions')}
                </h1>
                <FiClipboard className="w-xm h-xm text-fichasPay-main-400" />
              </div>
              <div className="flex flex-col items-start gap-s self-stretch">
                <div className="mt-s w-full">
                  <TableDashboard data={transactions} />
                  <div className="flex justify-end items-center w-full mt-s">
                    <Link href="central/extract">
                      <Button
                        variant="text"
                        addIcon={
                          <FiArrowRight className="w-s h-s text-grey-900" />
                        }
                      >
                        {t('history')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-s w-full">
          {/* Filtro e Movimentações */}
          <div className="p-s flex flex-col items-center gap-xm rounded-sm bg-grey-300 shadow-DShadow-Special-X">
            <DashboardFilter
              buttonText=""
              onDateChange={handleDateChange}
              selectedClient={selectedClient}
            />
            <div className="flex flex-col items-start gap-xs self-stretch">
              <h1 className="text-BODY-M font-Regular text-grey-900">
                {t('movements')}
              </h1>
              <DashboardInfoCard
                preIcon={<PiHandDeposit className="h-[18px] w-[18px]" />}
                text={t('totalDeposits')}
                type="success"
                valueType="currency"
                value={transactionInfo?.deposits?.total || 0}
              />
              <DashboardInfoCard
                preIcon={<PiHandWithdraw className="h-[18px] w-[18px]" />}
                text={t('totalWithdrawals')}
                type="warning"
                valueType="currency"
                value={transactionInfo?.withdraws?.total || 0}
                isNegative
              />
              <DashboardInfoCard
                preIcon={<FiPieChart className="h-[18px] w-[18px]" />}
                text={t('movementsBalance')}
                type="info"
                valueType="currency"
                value={transactionInfo?.balanceday || 0}
              />
            </div>
          </div>
          <div className="px-s">
            <Divider />
          </div>
          <div className="p-s flex flex-col items-center gap-xm rounded-sm bg-grey-300 shadow-DShadow-Special-X">
            <div className="flex flex-col items-start gap-xs self-stretch">
              <h1 className="text-BODY-M font-Regular text-grey-900">
                {t('leads')}
              </h1>
              <DashboardInfoCard
                preIcon={<PiHandDeposit className="h-[18px] w-[18px]" />}
                text={t('totalLinks')}
                type="alert"
                value={linksData?.links?.total || 0}
              />
              <DashboardInfoCard
                preIcon={<PiHandWithdraw className="h-[18px] w-[18px]" />}
                text={t('newUsers')}
                type="success"
                addPrefix
                value={linksData?.newlinks?.total || 0}
              />
              <DashboardInfoCard
                preIcon={<FiPieChart className="h-[18px] w-[18px]" />}
                text={t('conversionRate')}
                type="info"
                value={linksData?.conversao || 0}
                valueType="percent"
              />
            </div>
          </div>
        </div>
      </div>
    </PanelTemplate>
  )
}

export default DashboardTemplate
