import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { getLinkToPremiumPaymentsTab } from '../../helpers';
import { asUserSession } from '../../../../helpers/express-session';
import api from '../../../../api';

export type PostCancelRecordCorrectionRequestRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

/**
 * Controller for the POST cancel record correction request route.
 * Deletes the transient form data for the given report id, fee record id, and
 * user, then redirects to the premium payments tab with the given fee record
 * id selected.
 * @param req - The request object
 * @param res - The response object
 */
export const postCancelRecordCorrectionRequest = async (req: PostCancelRecordCorrectionRequestRequest, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, userToken } = asUserSession(req.session);

    await api.deleteFeeRecordCorrectionTransientFormData(reportId, feeRecordId, user, userToken);

    return res.redirect(getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]));
  } catch (error) {
    console.error('Failed to post cancel record correction request %o', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
