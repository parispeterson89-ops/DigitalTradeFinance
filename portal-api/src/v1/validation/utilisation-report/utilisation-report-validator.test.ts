import { UTILISATION_REPORT_STATUS, UtilisationReportStatus } from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { InvalidReportStatusError } from '../../errors';
import { validateReportIsInReportNotReceivedState } from './utilisation-report-validator';
import { aNotReceivedUtilisationReportResponse, aUtilisationReportResponse } from '../../../../test-helpers/test-data/utilisation-report';

describe('utilisation report validator', () => {
  describe('validateReportIsInReportNotReceivedState', () => {
    it.each(difference(Object.values(UTILISATION_REPORT_STATUS), [UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED]))(
      'throws InvalidReportStatusError if report has status %s',
      (status: UtilisationReportStatus) => {
        // Arrange
        const report = { ...aUtilisationReportResponse(), status };

        // Act + Assert
        expect(() => validateReportIsInReportNotReceivedState(report)).toThrow(InvalidReportStatusError);
      },
    );

    it('does not throw if report has REPORT_NOT_RECEIVED status', () => {
      // Arrange
      const report = aNotReceivedUtilisationReportResponse();

      // Assert
      expect(() => validateReportIsInReportNotReceivedState(report)).not.toThrow();
    });
  });
});
