import Textfield from '@/components/atoms/Textfield'
import { showToast } from '@/components/atoms/Toast'
import Table from '@/components/molecules/DataTable/Table'
import Dialog from '@/components/molecules/Dialog'
import { DialogButton } from '@/components/molecules/DialogButton'
import { MyClient } from '@/entities/my-clients'
import { removePlayer } from '@/services/clients/clients'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import {
  FiAlertTriangle,
  FiCheck,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { formatterLinkedAccountsToLinkedAccountsTable } from './formatter'
import info from './info'
import { ILinkedAccountsTable } from './types'
import { confirmUserLinkById, deleteUserLinkById } from '@/services/user/user'

interface LinkedAccountsProps {
  clientData?: MyClient
  onClose?: () => void
  onLoadClients?: () => void
}

interface Dialog {
  dialogTitle: string
  variant?: 'success' | 'warning'
  buttonName: string
  iconButton: React.JSX.Element
  message: string
  onSubmit: () => Promise<void>
  size?: 'sm' | 'md' | 'lg'
}

export interface OpenDialog {
  type?: 'aprove' | 'reprove'
  accountId?: number
}

export const LinkedAccounts: React.FC<LinkedAccountsProps> = ({
  clientData,
  onClose,
  onLoadClients,
}) => {
  const t = useTranslations()
  const { getColumns } = info
  const linkedAccounts = formatterLinkedAccountsToLinkedAccountsTable(
    clientData?.accounts ?? [],
  )
  const [search, setSearch] = React.useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [dialog, setDialog] = useState<Dialog>({} as Dialog)
  const [accountsFiltered, setAccountsFiltered] =
    useState<ILinkedAccountsTable[]>(linkedAccounts)

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  useEffect(() => {
    setAccountsFiltered(linkedAccounts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientData?.accounts])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value
    setSearch(search)
    if (search) {
      const filtered = linkedAccounts.filter(
        (account) =>
          account.player.name.toLowerCase().includes(search.toLowerCase()) ||
          account.player.id.toString().includes(search),
      )
      setAccountsFiltered(filtered)
    } else {
      setAccountsFiltered(linkedAccounts)
    }
  }

  const handleOpenDialog = ({ type, accountId }: OpenDialog) => {
    switch (type) {
      case 'aprove': {
        setDialog({
          dialogTitle: t(
            'Panel.MyClients.editMyClientDialog.dialogs.playerApproval.dialogTitle',
          ),
          variant: 'success',
          buttonName: t(
            'Panel.MyClients.editMyClientDialog.dialogs.playerApproval.buttonName',
          ),
          iconButton: <FiCheck size={18} className="text-grey-300" />,
          message: t(
            'Panel.MyClients.editMyClientDialog.dialogs.playerApproval.message',
          ),
          onSubmit: () => handleAcceptPlayer(accountId),
          size: 'md',
        })
        break
      }
      case 'reprove': {
        setDialog({
          dialogTitle: t(
            'Panel.MyClients.editMyClientDialog.dialogs.playerDenial.dialogTitle',
          ),
          variant: 'warning',
          buttonName: t(
            'Panel.MyClients.editMyClientDialog.dialogs.playerDenial.buttonName',
          ),
          iconButton: <FiX size={18} className="text-grey-300" />,
          message: t(
            'Panel.MyClients.editMyClientDialog.dialogs.playerDenial.message',
          ),
          size: 'md',
          onSubmit: () => handleDisapprovePlayer(accountId),
        })
        break
      }
      default: {
        setDialog({
          dialogTitle: t(
            'Panel.MyClients.editMyClientDialog.dialogs.playerDelete.dialogTitle',
          ),
          variant: 'warning',
          buttonName: t(
            'Panel.MyClients.editMyClientDialog.dialogs.playerDelete.buttonName',
          ),
          iconButton: <FiTrash2 size={18} className="text-grey-300" />,
          message: t(
            'Panel.MyClients.editMyClientDialog.dialogs.playerDelete.message',
          ),
          onSubmit: () => handleRemovePlayer(accountId),
          size: 'md',
        })
      }
    }
    setOpenDialog(true)
  }

  const handleAfterAction = async (toastMessage: string) => {
    await onLoadClients?.()
    showToast('success', t(toastMessage), 1000, 'bottom-left')
    handleCloseDialog()
  }

  const handleAcceptPlayer = async (accountId?: number) => {
    if (accountId && clientData) {
      try {
        await confirmUserLinkById({
          userId: clientData?.id,
          accountId,
        })

        await handleAfterAction(
          'Panel.MyClients.editMyClientDialog.toast.playerApproval',
        )
      } catch (error) {
        if (error instanceof Error) {
          showToast(
            'error',
            `${t(`Errors.${error.message}`)}`,
            5000,
            'bottom-left',
          )
        } else {
          showToast(
            'error',
            t('Errors.playerApproveByClub'),
            5000,
            'bottom-left',
          )
        }
      }
    }
  }

  const handleDisapprovePlayer = async (accountId?: number) => {
    try {
      await removePlayer({
        userId: clientData?.id,
        accountId,
      })
      await handleAfterAction(
        'Panel.MyClients.editMyClientDialog.toast.playerDenial',
      )
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          'error',
          `${t(`Errors.${error.message}`)}`,
          5000,
          'bottom-left',
        )
      } else {
        showToast('error', t('Errors.playerDenialByClub'), 5000, 'bottom-left')
      }
    }
  }

  const handleRemovePlayer = async (accountId?: number) => {
    if (accountId && clientData) {
      try {
        await deleteUserLinkById({
          userId: clientData?.id,
          accountId,
        })

        await handleAfterAction(
          'Panel.MyClients.editMyClientDialog.toast.playerDelete',
        )
      } catch (error) {
        if (error instanceof Error) {
          showToast(
            'error',
            `${t(`Errors.${error.message}`)}`,
            5000,
            'bottom-left',
          )
        } else {
          showToast(
            'error',
            t('Errors.playerDeleteByClub'),
            5000,
            'bottom-left',
          )
        }
      }
    }
  }

  const handleDialogSubmit = () => {
    dialog?.onSubmit?.()
  }

  return (
    <div className="flex flex-col gap-s">
      <div className="flex justify-end flex-col gap-s ">
        <div className="text-BODY-XM font-Regular text-grey-700 max-w-full">
          <Textfield
            name="search-accounts"
            placeholder={t(
              'Panel.MyClients.editMyClientDialog.linkedAccounts.searchPlaceholder',
            )}
            icon={<FiSearch size={24} className="text-grey-600" />}
            onChange={handleSearch}
            value={search}
          />
        </div>
      </div>
      <div className="flex flex-col gap-xm">
        <Table
          columns={getColumns(t, {
            onOpenDialog: handleOpenDialog,
          })}
          enablePagination={false}
          data={accountsFiltered}
          className="border-0"
        />

        <DialogButton
          buttonName="Salvar alterações"
          primary={{
            size: 'lg',
            disabled: true,
          }}
          secondary={{
            variant: 'text',
            size: 'lg',
            onClick: onClose,
          }}
        />
      </div>

      <Dialog
        title={dialog.dialogTitle}
        open={openDialog}
        onClose={handleCloseDialog}
        className="sm:max-w-[328px] max-w-[400px]"
        removeHeaderPaddingX
      >
        <div className="flex flex-col items-center justify-center gap-s my-xm">
          <FiAlertTriangle size={64} className="text-notify-alert-normal" />
          <p className="w-9/12 text-center text-BODY-XM text-grey-900 font-Regular">
            {dialog.message}
          </p>
          <DialogButton
            buttonName={dialog.buttonName}
            primary={{
              variant: dialog.variant,
              onClick: handleDialogSubmit,
              addIcon: dialog.iconButton,
              size: dialog.size ?? 'sm',
            }}
            secondary={{
              variant: 'text',
              onClick: handleCloseDialog,
            }}
          />
        </div>
      </Dialog>
    </div>
  )
}
