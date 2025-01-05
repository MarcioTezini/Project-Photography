import Button from '@/components/atoms/Button'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'
import { useSignupStore } from '@/stores/SignupStore'
import { useTranslations } from 'next-intl'
import React from 'react'
import { FiArrowRight, FiCheckSquare } from 'react-icons/fi'

interface ISuccess {
  type: 'active' | 'created'
}

interface ISuccessHeader {
  title: string
}

export const SignupStatusSuccess: React.FC<ISuccess> = ({ type }) => {
  const t = useTranslations()
  const { resetFormStep, onCloseForm } = useSignupStore()
  const { setOpenHomeLoginDialog } = useHomeLoginDialogStore()

  const SuccessHeader: React.FC<ISuccessHeader> = ({ title }) => {
    return (
      <>
        <FiCheckSquare size={80} className="text-notify-success-normal" />

        <p className="text-H6 font-Bold text-grey-300">
          {title}{' '}
          <span className="text-notify-success-normal">
            {t('Panel.Register.registerForm.statusStep.active.titleSuccess')}
          </span>
        </p>
      </>
    )
  }

  return (
    <>
      {type === 'active' ? (
        <div className="flex flex-col items-center text-center mt-xm gap-xm">
          <SuccessHeader
            title={t('Panel.Register.registerForm.statusStep.active.title')}
          />
          <p className="text-BODY-XM font-Bold text-grey-300">
            {t(
              'Panel.Register.registerForm.statusStep.active.description.boldText',
            )}
            <p className="text-BODY-S font-Regular mt-s text-grey-300">
              {t(
                'Panel.Register.registerForm.statusStep.active.description.regularText',
              )}
            </p>
          </p>
          <div className="flex flex-col gap-s">
            <Button
              variant="primary"
              isBrandButton
              size="lg"
              addIcon={<FiArrowRight size={20} />}
              onClick={() => {
                onCloseForm()
                resetFormStep()
                setOpenHomeLoginDialog(true)
              }}
            >
              {t(
                'Panel.Register.registerForm.statusStep.active.button.primary',
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center mt-xm gap-xm">
          <SuccessHeader
            title={t('Panel.Register.registerForm.statusStep.created.title')}
          />

          <p className="text-BODY-S font-Regular text-grey-300">
            {t(
              'Panel.Register.registerForm.statusStep.created.description.regularText',
            )}
          </p>

          <p className="text-BODY-S font-Regular text-grey-300">
            {t(
              'Panel.Register.registerForm.statusStep.active.description.regularText',
            )}
          </p>
          <div className="flex flex-col gap-s">
            <Button
              variant="primary"
              isBrandButton
              size="lg"
              addIcon={<FiArrowRight size={20} />}
              onClick={() => {
                onCloseForm()
                resetFormStep()
                setOpenHomeLoginDialog(true)
              }}
            >
              {t(
                'Panel.Register.registerForm.statusStep.active.button.primary',
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
