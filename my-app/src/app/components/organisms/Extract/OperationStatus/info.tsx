import { UseTranslationsReturn } from '@/types/use-translations-return'

export type TransactionStatus = 'pending' | 'success' | 'error' | 'info'

type StatusTexts = {
  [key: number]: Partial<Record<TransactionStatus, string>>
}

export const getStatusTexts = (t: UseTranslationsReturn): StatusTexts => {
  return {
    0: {
      info: t(
        'Panel.Extract.dialogTransactionDetails.status.transactionStarted',
      ),
    },
    1: {
      success: t(
        'Panel.Extract.dialogTransactionDetails.status.requestReceived',
      ),
    },
    2: {
      pending: t(
        'Panel.Extract.dialogTransactionDetails.status.chipsWithdrawnPending',
      ),
      success: t(
        'Panel.Extract.dialogTransactionDetails.status.chipsWithdrawnSuccess',
      ),
      error: t(
        'Panel.Extract.dialogTransactionDetails.status.chipsWithdrawnError',
      ),
    },
    3: {
      pending: t(
        'Panel.Extract.dialogTransactionDetails.status.waitingForApproval',
      ),
    },
    4: {
      pending: t(
        'Panel.Extract.dialogTransactionDetails.status.waitingForPayment',
      ),
    },
    5: {
      error: t('Panel.Extract.dialogTransactionDetails.status.rejectedBy'),
    },
    6: {
      success: t(
        'Panel.Extract.dialogTransactionDetails.status.paymentCompleted',
      ),
    },
    7: {
      success: t(
        'Panel.Extract.dialogTransactionDetails.status.qrCodeGeneratedSuccess',
      ),
      error: t(
        'Panel.Extract.dialogTransactionDetails.status.qrCodeGeneratedError',
      ),
    },
    8: {
      success: t(
        'Panel.Extract.dialogTransactionDetails.status.paymentReceived',
      ),
    },
    9: {
      success: t('Panel.Extract.dialogTransactionDetails.status.chipsReversed'),
    },
    10: {
      success: t('Panel.Extract.dialogTransactionDetails.status.chipsSent'),
    },
    11: {
      pending: t(
        'Panel.Extract.dialogTransactionDetails.status.noChipsInClubCashier',
      ),
    },
    12: {
      error: t(
        'Panel.Extract.dialogTransactionDetails.status.errorSendingChips',
      ),
    },
    13: {
      pending: t(
        'Panel.Extract.dialogTransactionDetails.status.waitingForDeposit',
      ),
    },
    14: {
      error: t(
        'Panel.Extract.dialogTransactionDetails.status.errorProcessingPayment',
      ),
    },
    15: {
      error: t(
        'Panel.Extract.dialogTransactionDetails.status.closedForNonPayment',
      ),
    },
    16: {
      pending: t(
        'Panel.Extract.dialogTransactionDetails.status.refundInProgress',
      ),
    },
    17: {
      error: t(
        'Panel.Extract.dialogTransactionDetails.status.refundedPaymentError',
      ),
    },
    18: {
      error: t(
        'Panel.Extract.dialogTransactionDetails.status.reversedReceiptAnotherDocument',
      ),
    },
    19: {
      error: t(
        'Panel.Extract.dialogTransactionDetails.status.transactionCanceled',
      ),
    },
    20: {
      success: t(
        'Panel.Extract.dialogTransactionDetails.status.transactionCompleted',
      ),
    },
    21: {
      error: t('Panel.Extract.dialogTransactionDetails.status.error'),
    },
    22: {
      pending: t('Panel.Extract.dialogTransactionDetails.status.audit'),
    },
  }
}

const info = {
  getStatusTexts,
}

export default info
