import { ErrorSummaryViewModel } from '../../../types/view-models';

export type RemoveFeesFromPaymentErrorKey = 'no-fee-records-selected' | 'all-fee-records-selected';

const removeFeesFromPaymentErrorMap: Record<RemoveFeesFromPaymentErrorKey, [ErrorSummaryViewModel]> = {
  'no-fee-records-selected': [
    {
      text: 'Select fee or fees to remove from the payment',
      href: '#added-reported-fees-details-header',
    },
  ],
  'all-fee-records-selected': [
    {
      text: 'You cannot remove all the fees. Delete the payment instead.',
      href: '#added-reported-fees-details-header',
    },
  ],
};

export const getRemoveFeesFromPaymentError = (removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey): [ErrorSummaryViewModel] =>
  removeFeesFromPaymentErrorMap[removeFeesFromPaymentErrorKey];