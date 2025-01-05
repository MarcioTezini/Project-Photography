import React, { useEffect, useState } from 'react'
import Dialog from '@/components/molecules/Dialog'
import useLinkedAccountsDialogStore from '@/stores/LinkedAccountsDialog'
import CardsList from '@/components/atoms/CardsList'
import { FiArrowLeft, FiLoader } from 'react-icons/fi'
import { BsFillPatchCheckFill, BsClockFill } from 'react-icons/bs'
import Button from '@/components/atoms/Button'
import { disableUserLink, getUserLinks, UserLink } from '@/services/user/user'
import { useTranslations } from 'next-intl'
import { showToast } from '@/components/atoms/Toast'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'

const LinkedAccountsDialog = () => {
  const t = useTranslations()
  const {
    openLinkedAccountsDialog,
    handleCloseDialog,
    openConfirmDeleteModal,
    setConfirmDeleteModal,
  } = useLinkedAccountsDialogStore()
  const { setOpenLoginDialog } = useHomeLoginDialogStore()
  const [isLoadingLinks, setIsLoadingLinks] = useState(false)

  const [links, setLinks] = useState<UserLink[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    const fetchLink = async () => {
      setIsLoadingLinks(true)
      try {
        const response = await getUserLinks()

        if (response?.success && Array.isArray(response.data)) {
          const linkData = response.data
          setLinks(linkData)
        }
        setIsLoadingLinks(false)
      } catch (error) {
        setIsLoadingLinks(false)
        if (error instanceof Error) {
          showToast('error', `Error: ${error.message}`, 5000, 'bottom-left')
        } else {
          showToast('error', 'Unknown error occurred', 5000, 'bottom-left')
        }
      }
    }

    fetchLink()
  }, [setLinks])

  const handleLinkedAccount = () => {
    setOpenLoginDialog(true)
    handleCloseDialog()
  }

  const handleDeleteLink = async () => {
    if (selectedId !== null) {
      try {
        await disableUserLink(selectedId)
        setConfirmDeleteModal(false)
        setLinks((prevLinks) =>
          prevLinks.filter((link) => link.id !== selectedId),
        )
        showToast(
          'success',
          t('Home.linkedAccounts.RemoveAccounts'),
          5000,
          'bottom-left',
        )
      } catch (error) {}
    }
  }

  return (
    <>
      <Dialog
        position="aside"
        title={t('Home.linkedAccounts.titleDialog')}
        open={openLinkedAccountsDialog}
        onClose={handleCloseDialog}
        className="w-[531px]"
        isDarkMode
      >
        {isLoadingLinks ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <FiLoader className="animate-spin text-H3 text-grey-500" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="p-xm w-[360px] flex flex-col items-center sm:px-s sm:py-xm sm:w-[328px]">
              <CardsList
                clubs={links.map((link) => ({
                  id: link.playerID.toString(),
                  playerName: link.playerName,
                  imageUrl: link.logo,
                  clubName: link.clubName,
                  appName: link.app,
                  verified:
                    link.verified === 1 ? (
                      <BsFillPatchCheckFill className="text-notify-success-normal" />
                    ) : (
                      <BsClockFill className="text-notify-alert-normal" />
                    ),
                  onIconClick: () => {
                    setSelectedId(link.id)
                    setConfirmDeleteModal(true)
                  },
                }))}
                showClubId={false}
                showCloseIcon={true}
                marginBottom="mb-s"
              />

              <div>
                <p className="text-BODY-S text-grey-300 text-center py-m">
                  {t('Home.linkedAccounts.TextLinked')}
                </p>
              </div>
              <div className="flex gap-s mt-xs mb-m">
                <Button
                  preIcon={<FiArrowLeft width={20} height={20} />}
                  type="button"
                  size="lg"
                  variant="outline"
                  hasShadow={false}
                  className="!text-grey-300 hover:bg-grey-800"
                  width={110}
                  noBorder
                  noShadow
                  onClick={handleCloseDialog}
                >
                  {t('Home.linkedAccounts.ButtonBack')}
                </Button>
                <Button onClick={handleLinkedAccount} isBrandButton>
                  <label className="text-grey-900 text-BODY-M">
                    {t('Home.linkedAccounts.ButtonLinked')}
                  </label>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
      {openConfirmDeleteModal && (
        <Dialog
          title={t('Home.linkedAccounts.TitleRemoveDialog')}
          open={openConfirmDeleteModal}
          onClose={() => setConfirmDeleteModal(false)}
          className="max-w-[328px] h-[328px]"
          isDarkMode
        >
          <div className="flex flex-col items-center justify-center gap-s mb-s mt-s">
            <div>
              <p className="!text-grey-300 text-BODY-XM text-center py-s">
                <strong>{t('Home.linkedAccounts.TitleDialog')}</strong>
              </p>
              <p className="text-BODY-XM font-Regular text-grey-300 text-center px-xxm">
                {t('Home.linkedAccounts.TextDialog')}
              </p>
            </div>
            <div className="flex justify-center items-center gap-s self-stretch mt-xs">
              <Button
                variant="warning"
                onClick={handleDeleteLink}
                className="cursor-pointer"
              >
                <label className="text-grey-300 text-BODY-M">
                  {t('Home.linkedAccounts.ButtonRemove')}
                </label>
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}

export default LinkedAccountsDialog
