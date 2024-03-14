import { Request } from 'express';
import { validationResult } from 'express-validator';
import { createRequest } from 'node-mocks-http';
import { ObjectId } from 'bson';
import { updateReportStatusPayloadValidation } from '.';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../../constants';
import { TfmSessionUser } from '../../../../types/tfm-session-user';
import { ReportWithStatus, UtilisationReportReconciliationStatus } from '../../../../types/utilisation-reports';
import { UpdateUtilisationReportStatusRequestBody } from '../../../controllers/utilisation-reports/update-utilisation-report-status.controller';
import { MOCK_TFM_SESSION_USER } from '../../../__mocks__/mock-tfm-session-user';

type ValidPayloadBodyOpts = {
  user?: TfmSessionUser;
  reportsWithStatus?: ReportWithStatus[];
  status?: UtilisationReportReconciliationStatus;
  reportId?: string;
};

describe('updateReportStatusPayloadValidation', () => {
  const getValidPayloadBody = (opts: ValidPayloadBodyOpts): UpdateUtilisationReportStatusRequestBody => ({
    user: opts.user ?? MOCK_TFM_SESSION_USER,
    reportsWithStatus: opts.reportsWithStatus ?? [
      {
        status: opts.status ?? UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
        reportId: opts.reportId ?? new ObjectId().toString(),
      },
    ],
  });

  const getUpdateReportStatusPayloadValidationResult = async (req: Request) => {
    await Promise.all(updateReportStatusPayloadValidation.map((validator) => validator.run(req)));
    return validationResult(req).array();
  };

  it('returns some errors when the report id does not exist', async () => {
    // Arrange
    const reportsWithStatus = [
      {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
      },
    ];
    // @ts-expect-error `reportsWithStatus` is purposefully missing `reportId`
    const body = getValidPayloadBody({ reportsWithStatus });
    const req = createRequest({ body });

    // Act
    const errors = await getUpdateReportStatusPayloadValidationResult(req);

    // Assert
    expect(errors.length).not.toEqual(0);
  });

  it('returns a single error when the report id is not a valid mongo id', async () => {
    // Arrange
    const reportId = '123';
    const body = getValidPayloadBody({ reportId });
    const req = createRequest({ body });

    // Act
    const errors = await getUpdateReportStatusPayloadValidationResult(req);

    // Assert
    expect(errors.length).toEqual(1);
    expect(errors.at(0)?.msg).toEqual('Report id must be a valid mongo id string');
  });

  it('returns a single error when the user is not an object', async () => {
    // Arrange
    const user = 'Test user';
    // @ts-expect-error user is supposed to be invalid for this test
    const body = getValidPayloadBody({ user });
    const req = createRequest({ body });

    // Act
    const errors = await getUpdateReportStatusPayloadValidationResult(req);

    // Assert
    expect(errors.length).toEqual(1);
    expect(errors.at(0)?.msg).toEqual("Expected body to contain 'user' object");
  });

  it('returns a single error when reportsWithStatus is an empty array', async () => {
    // Arrange
    const reportsWithStatus: ReportWithStatus[] = [];
    const body = getValidPayloadBody({ reportsWithStatus });
    const req = createRequest({ body });

    // Act
    const errors = await getUpdateReportStatusPayloadValidationResult(req);

    // Assert
    expect(errors.length).toEqual(1);
    expect(errors.at(0)?.msg).toEqual("Expected body to contain non-empty 'reportsWithStatus' array");
  });

  it('returns a single error when the status is not a valid status', async () => {
    // Arrange
    const status = 'INVALID_STATUS' as UtilisationReportReconciliationStatus;
    const body = getValidPayloadBody({ status });
    const req = createRequest({ body });

    // Act
    const errors = await getUpdateReportStatusPayloadValidationResult(req);

    // Assert
    expect(errors.length).toEqual(1);
    expect(errors.at(0)?.msg).toContain('Report status must be one of the following:');
  });

  describe('for a valid payload', () => {
    it.each([
      { status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED },
      { status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION },
    ])('returns no errors when the status is $status', async ({ status }) => {
      // Arrange
      const body = getValidPayloadBody({ status });
      const req = createRequest({ body });

      // Act
      const errors = await getUpdateReportStatusPayloadValidationResult(req);

      // Assert
      expect(errors.length).toEqual(0);
    });
  });
});