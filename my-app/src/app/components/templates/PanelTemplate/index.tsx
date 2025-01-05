'use client'

import React, { useEffect, useRef } from 'react'
import { useClientStore } from '@/stores/ClientStore'
import { getClients, updateClientInSession } from '@/services/clients/clients'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import DialogMembershipContract from '@/components/organisms/DialogMembershipContract'
import { useMe } from '@/stores/Me'
import { usePathname } from 'next/navigation'
import { getUserData } from '@/services/user/user'
import Combobox from '@/components/atoms/Combobox'

const MediaQuery = dynamic(() => import('react-responsive'), {
  ssr: false,
})

interface PanelTemplateProps {
  headerContent?: React.ReactNode
  children: React.ReactNode
  title: string
  icon?: React.ReactNode
}

const countClientsBySpecificPlan = (
  clients: { plano: string }[],
  targetPlan: string,
) => {
  return clients.reduce((count, client) => {
    if (client.plano === targetPlan) {
      count++
    }
    return count
  }, 0)
}

export function PanelTemplate({ children, title, icon }: PanelTemplateProps) {
  const t = useTranslations()
  const { clients, setClients, selectedClient, setSelectedClient } =
    useClientStore()
  const { me, setMe } = useMe()
  const pathname = usePathname()
  const hasFetchedRef = useRef(false)

  const sortedItems = clients.toSorted((a, b) => {
    // Comparar o plano
    if (a.plano < b.plano) return -1
    if (a.plano > b.plano) return 1
    // Se o plano for igual, comparar o nome
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  })

  const counts = countClientsBySpecificPlan(clients, 'Suprema Pay')

  const options = sortedItems.map((client) => ({
    value: client.cliid.toString(),
    label: client.name,
  }))

  const {
    setIsSaveChangesDialogOpen,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setIsClientChanging,
  } = useSaveChangesDialogStore()

  const handleChange = async (value: string) => {
    const clientId = parseInt(value, 10)
    const client = clients.find((client) => client.cliid === clientId)

    if (!hasUnsavedChanges) {
      if (client) {
        setSelectedClient(client)
        localStorage.setItem('clientId', value)
        if (hasUnsavedChanges) {
          setIsSaveChangesDialogOpen(true)
        }
        setHasUnsavedChanges(false)
        try {
          await updateClientInSession(clientId)
        } catch (error) {
          console.error('Failed to update client in session:', error)
        }
      }
    } else {
      setIsClientChanging(true)
      setIsSaveChangesDialogOpen(true)
    }
  }

  useEffect(() => {
    const fetchClients = async () => {
      if (clients.length === 0) {
        try {
          const response = await getClients()
          if (response.success) {
            setClients(response.data)
          }
        } catch (error) {
          console.error('Failed to get clients:', error)
        }
      }
    }

    fetchClients()

    const storedClientId = localStorage.getItem('clientId')
    if (storedClientId) {
      const cliid = parseInt(storedClientId, 10)
      const client = clients.find((client) => client.cliid === cliid)
      if (client) {
        setSelectedClient(client)
      }
    }
  }, [clients, setClients, setSelectedClient])

  const handleSelectorClick = () => {
    if (hasUnsavedChanges) {
      setIsClientChanging(true)
      setIsSaveChangesDialogOpen(true) // Exibe o diálogo de alterações salvas
    }
  }

  const fetchUserData = async () => {
    try {
      const userData = await getUserData()
      if (userData?.data) {
        setMe(userData.data)
      }
    } catch (error) {
      console.error('Failed to fetch user data', error)
    }
  }

  useEffect(() => {
    const excludedPaths = ['wl/colors', 'wl/footer', 'wl/contents'] // Páginas que o me já é chamado na renderização
    const shouldFetch = !excludedPaths.some((path) => pathname.includes(path))

    if (shouldFetch && !hasFetchedRef.current) {
      fetchUserData()
      hasFetchedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      {!me?.detail?.client?.termAdhesion &&
        me?.detail?.client?.perm &&
        me.level === 2 && <DialogMembershipContract />}
      <div className="flex bg-grey-400 pl-xxxm sm:pl-0">
        <div className="w-full overflow-y-auto">
          <div
            className="
      flex-grow
      transition-all
      duration-300
      ease-in-out
      pr-xm
      sm:pr-s
      sm:pl-s
      h-screen
      "
          >
            <header className="flex justify-between items-center py-xm sm:flex-col md:flex-col sm:items-end md:items-start sm:gap-s md:gap-s">
              <div className="flex items-center gap-xs text-grey-900">
                {icon}
                <h1 className="text-2xl font-bold uppercase text-grey-900 font-Semibold">
                  {title}
                </h1>
              </div>
              <MediaQuery minWidth={1366}>
                <Combobox
                  placeholder={t('Panel.PanelTemplate.selectClientPlaceholder')}
                  value={selectedClient?.cliid.toString() || ''}
                  onChange={handleChange}
                  options={options}
                  width={330}
                  disabled={options.length === 1}
                  separatorInPosition={counts - 1}
                  messageSeparator="Whitelabel"
                  onClick={handleSelectorClick}
                />
              </MediaQuery>
              <MediaQuery maxWidth={1365}>
                <Combobox
                  placeholder={t('Panel.PanelTemplate.selectClientPlaceholder')}
                  value={selectedClient?.cliid.toString() || ''}
                  onChange={handleChange}
                  options={options}
                  disabled={options.length === 1}
                  separatorInPosition={counts - 1}
                  messageSeparator="Whitelabel"
                  onClick={handleSelectorClick}
                />
              </MediaQuery>
            </header>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default PanelTemplate
