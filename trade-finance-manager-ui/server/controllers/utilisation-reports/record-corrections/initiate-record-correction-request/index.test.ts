import httpMocks from 'node-mocks-http';
import { FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import difference from 'lodash.difference';
import { validateRecordCorrectionRequestFeeSelections, postInitiateRecordCorrectionRequest, PostInitiateRecordCorrectionRequest } from '.';
import { INITIATE_RECORD_CORRECTION_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { PremiumPaymentsTableCheckboxSelectionsRequestBody } from '../../helpers';
import { PremiumPaymentsTableCheckboxId } from '../../../../types/premium-payments-table-checkbox-id';
import { aTfmSessionUser } from '../../../../../test-helpers';
import api from '../../../../api';

jest.mock('../../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/initiate-record-correction-request', () => {
  describe('validateRecordCorrectionRequestFeeSelections', () => {
    describe('when no checkboxes are selected', () => {
      const checkedCheckboxIds: PremiumPaymentsTableCheckboxId[] = [];

      it(`should return '${INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED}' error key`, () => {
        // Act
        const result = validateRecordCorrectionRequestFeeSelections(checkedCheckboxIds);

        // Assert
        expect(result).toEqual({ errorKey: INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED, selectedFeeRecordId: null });
      });
    });

    describe('when multiple checkboxes are selected', () => {
      const checkedCheckboxIds: PremiumPaymentsTableCheckboxId[] = [
        'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO',
        'feeRecordIds-789-reportedPaymentsCurrency-GBP-status-TO_DO',
      ];

      it(`should return '${INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED}' error key`, () => {
        // Act
        const result = validateRecordCorrectionRequestFeeSelections(checkedCheckboxIds);

        // Assert
        expect(result).toEqual({ errorKey: INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED, selectedFeeRecordId: null });
      });
    });

    describe.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.TO_DO]))(
      'when a checkbox in status %s is selected',
      (status: FeeRecordStatus) => {
        const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-456-reportedPaymentsCurrency-GBP-status-${status}`;
        const checkedCheckboxIds: PremiumPaymentsTableCheckboxId[] = [checkboxId];

        it(`should return '${INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS}' error key`, () => {
          // Act
          const result = validateRecordCorrectionRequestFeeSelections(checkedCheckboxIds);

          // Assert
          expect(result).toEqual({ errorKey: INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS, selectedFeeRecordId: null });
        });
      },
    );

    describe(`when a single checkbox in status ${FEE_RECORD_STATUS.TO_DO} is selected`, () => {
      const checkedCheckboxIds: PremiumPaymentsTableCheckboxId[] = ['feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO'];

      it(`should return selected fee record id`, () => {
        // Act
        const result = validateRecordCorrectionRequestFeeSelections(checkedCheckboxIds);

        // Assert
        expect(result).toEqual({ errorKey: null, selectedFeeRecordId: 456 });
      });
    });

    describe(`when a single checkbox in status ${FEE_RECORD_STATUS.TO_DO} is selected but has multiple fee records in checkbox id`, () => {
      const checkedCheckboxIds: PremiumPaymentsTableCheckboxId[] = ['feeRecordIds-456,789-reportedPaymentsCurrency-GBP-status-TO_DO'];

      it(`should throw an error`, () => {
        // Act + Assert
        expect(() => validateRecordCorrectionRequestFeeSelections(checkedCheckboxIds)).toThrow(
          new Error(`Invalid premium payments checkbox id encountered for fee record at ${FEE_RECORD_STATUS.TO_DO} status ${checkedCheckboxIds[0]}`),
        );
      });
    });
  });

  describe('postInitiateRecordCorrectionRequest', () => {
    const userToken = 'user-token';
    const user = aTfmSessionUser();
    const aRequestSession = () => ({
      userToken,
      user,
    });

    describe.each`
      testName                                     | requestBody
      ${'when no checkboxes are selected'}         | ${{}}
      ${'when an invalid checkbox id is provided'} | ${{ 'feeRecordIds--reportedPaymentsCurrency-GBP-status-TO_DO': 'on' }}
    `('$testName', ({ requestBody }: { requestBody: PremiumPaymentsTableCheckboxSelectionsRequestBody }) => {
      it(`should redirect to premium payments page with '${INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED}' error`, async () => {
        // Arrange
        const reportId = '123';
        const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
          params: { reportId },
          session: aRequestSession(),
          body: requestBody,
        });

        // Act
        await postInitiateRecordCorrectionRequest(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}`);
        expect(req.session.initiateRecordCorrectionRequestErrorKey).toEqual(INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED);
        expect(req.session.checkedCheckboxIds).toEqual({});
      });
    });

    describe('when multiple checkboxes are selected', () => {
      const requestBody: PremiumPaymentsTableCheckboxSelectionsRequestBody = {
        'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
        'feeRecordIds-789-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
      };

      const expectedCheckedCheckboxIds = {
        'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': true,
        'feeRecordIds-789-reportedPaymentsCurrency-GBP-status-TO_DO': true,
      };

      it(`should redirect to premium payments page with '${INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED}' error`, async () => {
        // Arrange
        const reportId = '123';
        const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
          params: { reportId },
          session: aRequestSession(),
          body: requestBody,
        });

        // Act
        await postInitiateRecordCorrectionRequest(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}`);
        expect(req.session.initiateRecordCorrectionRequestErrorKey).toEqual(INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED);
        expect(req.session.checkedCheckboxIds).toEqual(expectedCheckedCheckboxIds);
      });
    });

    describe.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.TO_DO]))(
      'when a checkbox in status %s is selected',
      (status: FeeRecordStatus) => {
        const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-456-reportedPaymentsCurrency-GBP-status-${status}`;
        const requestBody = {
          [checkboxId]: 'on',
        };

        const expectedCheckedCheckboxIds = {
          [checkboxId]: true,
        };

        it(`should redirect to premium payments page with '${INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS}' error`, async () => {
          // Arrange
          const reportId = '123';
          const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
            params: { reportId },
            session: aRequestSession(),
            body: requestBody,
          });

          // Act
          await postInitiateRecordCorrectionRequest(req, res);

          // Assert
          expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}`);
          expect(req.session.initiateRecordCorrectionRequestErrorKey).toEqual(INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS);
          expect(req.session.checkedCheckboxIds).toEqual(expectedCheckedCheckboxIds);
        });
      },
    );

    describe(`when a single checkbox in status ${FEE_RECORD_STATUS.TO_DO} is selected`, () => {
      const selectedFeeRecordId = '456';
      const requestBody: PremiumPaymentsTableCheckboxSelectionsRequestBody = {
        [`feeRecordIds-${selectedFeeRecordId}-reportedPaymentsCurrency-GBP-status-TO_DO`]: 'on',
      };

      it('should clear transient form data', async () => {
        // Arrange
        const reportId = '123';
        const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
          params: { reportId },
          session: aRequestSession(),
          body: requestBody,
        });

        // Act
        await postInitiateRecordCorrectionRequest(req, res);

        // Assert
        expect(api.deleteFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
        expect(api.deleteFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(reportId, selectedFeeRecordId, user, userToken);
      });

      it(`should redirect to create record correction request page`, async () => {
        // Arrange
        const reportId = '123';
        const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
          params: { reportId },
          session: aRequestSession(),
          body: requestBody,
        });

        // Act
        await postInitiateRecordCorrectionRequest(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}/create-record-correction-request/456`);
        expect(req.session.initiateRecordCorrectionRequestErrorKey).toBeUndefined();
        expect(req.session.checkedCheckboxIds).toBeUndefined();
      });
    });

    describe(`when a single checkbox in status ${FEE_RECORD_STATUS.TO_DO} is selected but has multiple fee records in checkbox id`, () => {
      const requestBody: PremiumPaymentsTableCheckboxSelectionsRequestBody = {
        'feeRecordIds-456,789-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
      };

      it(`should render problem with service page`, async () => {
        // Arrange
        const requestSession = aRequestSession();
        const reportId = '123';
        const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
          params: { reportId },
          session: requestSession,
          body: requestBody,
        });

        // Act
        await postInitiateRecordCorrectionRequest(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
        expect(res._getRenderData()).toEqual({ user: requestSession.user });
      });
    });
  });
});
