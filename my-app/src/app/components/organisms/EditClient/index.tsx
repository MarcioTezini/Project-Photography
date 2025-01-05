import TabContent from '@/components/atoms/TabContent'
import MenuTab from '@/components/molecules/MenuTab'
import { MyClient } from '@/entities/my-clients'
import React from 'react'
import { LinkedAccounts } from './LinkedAccounts'
import { RegistrationData } from './RegistrationData'
import { Settings } from './Settings'
import { useTranslations } from 'next-intl'

interface EditClientProps {
  clientData?: MyClient
  closeEditing?: () => void
  onLoadClients?: () => void
}

export const EditClient: React.FC<EditClientProps> = ({
  clientData,
  closeEditing,
  onLoadClients,
}) => {
  const t = useTranslations()
  const tabs = [
    {
      label: t('Panel.MyClients.editMyClientDialog.tabs.0'),
      value: 'registration-data',
    },
    {
      label: t('Panel.MyClients.editMyClientDialog.tabs.1'),
      value: 'linked-accounts',
    },
    {
      label: t('Panel.MyClients.editMyClientDialog.tabs.2'),
      value: 'settings',
    },
  ]

  return (
    <div className="mt-xm mb-xl mx-auto max-w-[420px]">
      <MenuTab tabs={tabs} defaultValue={tabs[0].value} className="mx-auto">
        <div className="w-10/12 mt-xm mx-auto">
          <TabContent value="registration-data">
            <RegistrationData
              clientData={clientData}
              closeEditing={closeEditing}
              onSuccessfulEdit={onLoadClients}
            />
          </TabContent>
          <TabContent value="linked-accounts">
            <LinkedAccounts
              clientData={clientData}
              onLoadClients={onLoadClients}
              onClose={closeEditing}
            />
          </TabContent>
          <TabContent value="settings">
            <Settings
              clientData={clientData}
              onClose={closeEditing}
              disabled
              onSuccessfulEdit={onLoadClients}
            />
          </TabContent>
        </div>
      </MenuTab>
    </div>
  )
}
