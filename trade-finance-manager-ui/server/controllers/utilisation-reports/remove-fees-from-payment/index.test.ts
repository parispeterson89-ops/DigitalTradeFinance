import httpMocks from 'node-mocks-http';
import { postRemoveFeesFromPayment } from '.';
import api from '../../../api';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';
import { RemoveFeesFromPaymentFormRequestBody } from '../../../helpers/remove-fees-from-payment-helper';

jest.mock('../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/remove-fees-from-payment', () => {
  describe('postRemoveFeesFromPayment', () => {
    const requestSession = {
      user: aTfmSessionUser(),
      userToken: 'abc123',
    };

    beforeEach(() => {
      jest.mocked(api.removeFeesFromPayment).mockResolvedValue();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('removes the selected fee records from the payment', async () => {
      // Arrange
      const selectedFeeRecordIds = [1, 2];
      const requestBodyForPostRemoveFeesFromPayment: RemoveFeesFromPaymentFormRequestBody = {
        ...selectedFeeRecordIds.map((id) => ({ [`feeRecordId-${id}`]: 'on' })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        totalSelectableFeeRecords: selectedFeeRecordIds.length.toString(),
      };

      const reportId = '1';
      const paymentId = '2';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, paymentId },
        body: requestBodyForPostRemoveFeesFromPayment,
      });

      // Act
      await postRemoveFeesFromPayment(req, res);

      // Assert
      expect(api.removeFeesFromPayment).toHaveBeenCalledWith(reportId, paymentId, selectedFeeRecordIds, requestSession.user, requestSession.userToken);
    });

    it("redirects to '/utilisation-reports/:reportId/edit-payment/:paymentId'", async () => {
      // Arrange
      const reportId = '1';
      const paymentId = '2';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, paymentId },
      });

      // Act
      await postRemoveFeesFromPayment(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
      expect(res._isEndCalled()).toBe(true);
    });

    it('renders the problem-with-service page when an error occurs', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '1', paymentId: '2' },
      });

      jest.mocked(api.removeFeesFromPayment).mockRejectedValue(new Error('Some error'));

      // Act
      await postRemoveFeesFromPayment(req, res);

      // Assert
      expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });
  });
});