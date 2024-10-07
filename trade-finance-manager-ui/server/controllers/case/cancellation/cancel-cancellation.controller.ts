import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { asUserSession } from '../../../helpers/express-session';
import { CancelCancellationViewModel } from '../../../types/view-models';
import api from '../../../api';
import { canSubmissionTypeBeCancelled } from '../../helpers';

export type CancelCancellationRequest = CustomExpressRequest<{ params: { _id: string } }>;

/**
 * controller to get the cancel cancellation page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getCancelCancellation = async (req: CancelCancellationRequest, res: Response) => {
  const { _id } = req.params;
  const { user, userToken } = asUserSession(req.session);
  try {
    const deal = await api.getDeal(_id, userToken);

    if (!deal || 'status' in deal) {
      return res.redirect('/not-found');
    }

    if (!canSubmissionTypeBeCancelled(deal.dealSnapshot.submissionType)) {
      return res.redirect(`/case/${_id}/deal`);
    }

    const cancelCancellationViewModel: CancelCancellationViewModel = {
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user,
      ukefDealId: deal.dealSnapshot.details.ukefDealId,
      previousPage: req.headers.referer ?? 'reason',
    };
    return res.render('case/cancellation/cancel.njk', cancelCancellationViewModel);
  } catch (error) {
    console.error('Error getting cancel cancellation page', error);
    return res.render('_partials/problem-with-service.njk');
  }
};