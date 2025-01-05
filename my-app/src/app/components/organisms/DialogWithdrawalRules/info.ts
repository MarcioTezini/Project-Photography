import { UseTranslationsReturn } from '@/types/use-translations-return'

const generateWithdrawalRulesSections = (t: UseTranslationsReturn) => [
  {
    title: t('Home.WithdrawalRules.rules.0.title'),
    description: t('Home.WithdrawalRules.rules.0.description'),
  },
  {
    title: t('Home.WithdrawalRules.rules.1.title'),
    description: t('Home.WithdrawalRules.rules.1.description'),
  },
  {
    title: t('Home.WithdrawalRules.rules.2.title'),
    description: t('Home.WithdrawalRules.rules.2.description'),
  },
  {
    title: t('Home.WithdrawalRules.rules.3.title'),
    description: t('Home.WithdrawalRules.rules.3.description'),
  },
  {
    title: t('Home.WithdrawalRules.rules.4.title'),
    description: t('Home.WithdrawalRules.rules.4.description'),
  },
]

const info = {
  generateWithdrawalRulesSections,
}

export default info
