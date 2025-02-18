import { when } from 'jest-when';
import { Not } from 'typeorm';
import { REPORT_NOT_RECEIVED, UtilisationReportEntity, UtilisationReportStatus } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from './utilisation-report.repo';

describe('UtilisationReportRepo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findReportingYearsByBankId', () => {
    const findSpy = jest.spyOn(UtilisationReportRepo, 'find');

    beforeEach(() => {
      findSpy.mockRejectedValue('Some error');
    });

    it('returns a set containing all the years where the report status is not REPORT_NOT_RECEIVED', async () => {
      // Arrange
      const bankId = '123';

      /**
       * These reports, when selected from the database, have the
       * `select` query option set to only select the `reportPeriod`
       * field, meaning the returned reports will have the same
       * structure as that shown below
       */
      const utilisationReportsWithOnlyReportPeriodSelected = [
        {
          reportPeriod: {
            start: { month: 1, year: 2020 },
            end: { month: 1, year: 2021 },
          },
        },
        {
          reportPeriod: {
            start: { month: 1, year: 2023 },
            end: { month: 1, year: 2023 },
          },
        },
      ] as UtilisationReportEntity[];

      when(findSpy)
        .calledWith({
          where: {
            bankId,
            status: Not<UtilisationReportStatus>(REPORT_NOT_RECEIVED),
          },
          select: ['reportPeriod'],
        })
        .mockResolvedValue(utilisationReportsWithOnlyReportPeriodSelected);

      // Act
      const result = await UtilisationReportRepo.findReportingYearsByBankId(bankId);

      // Assert
      expect(result).toEqual(new Set([2020, 2021, 2023]));
    });
  });
});
