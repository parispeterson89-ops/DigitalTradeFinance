import {
  getCurrentReportPeriodForBankSchedule,
  Bank,
  ReportPeriod,
  UtilisationReportEntityMockBuilder,
  UtilisationReportEntity,
  REQUEST_PLATFORM_TYPE,
  REPORT_NOT_RECEIVED,
} from '@ukef/dtfs2-common';
import { createUtilisationReportForBanksJob } from '.';
import { getAllBanks } from '../../repositories/banks-repo';
import { UtilisationReportRepo } from '../../repositories/utilisation-reports-repo';
import externalApi from '../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../constants/email-template-ids';

const { UTILISATION_REPORT_CREATION_FAILURE_EMAIL_ADDRESS } = process.env;

console.info = jest.fn();

jest.mock('../../repositories/banks-repo');
jest.mock('../../external-api/api');

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<object>('@ukef/dtfs2-common'),
  asString: (value: unknown) => value as string,
  getCurrentReportPeriodForBankSchedule: jest.fn(),
}));

const originalProcessEnv = { ...process.env };

describe('scheduler/jobs/create-utilisation-reports', () => {
  afterEach(() => {
    process.env = originalProcessEnv;
    jest.resetAllMocks();
  });

  let sendEmailSpy = jest.fn();

  const saveUtilisationReportSpy = jest.spyOn(UtilisationReportRepo, 'save');
  const findOneByBankIdAndReportPeriodSpy = jest.spyOn(UtilisationReportRepo, 'findOneByBankIdAndReportPeriod');

  const MONTHLY_REPORT_PERIOD_SCHEDULE = [
    { startMonth: 1, endMonth: 1 },
    { startMonth: 2, endMonth: 2 },
    { startMonth: 3, endMonth: 3 },
    { startMonth: 4, endMonth: 4 },
    { startMonth: 5, endMonth: 5 },
    { startMonth: 6, endMonth: 6 },
    { startMonth: 7, endMonth: 7 },
    { startMonth: 8, endMonth: 8 },
    { startMonth: 9, endMonth: 9 },
    { startMonth: 10, endMonth: 10 },
    { startMonth: 11, endMonth: 11 },
    { startMonth: 12, endMonth: 12 },
  ];

  const mockBank = {
    id: '123',
    name: 'Test bank',
    isVisibleInTfmUtilisationReports: true,
    utilisationReportPeriodSchedule: MONTHLY_REPORT_PERIOD_SCHEDULE,
  } as Bank;

  const banks = [
    {
      ...mockBank,
      id: '1',
      name: 'Bank 1',
    },
    {
      ...mockBank,
      id: '2',
      name: 'Bank 2',
    },
    {
      ...mockBank,
      id: '3',
      name: 'Bank 3',
    },
  ] as Bank[];

  const mockReportPeriod = {} as ReportPeriod;

  describe('the task', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.mocked(getCurrentReportPeriodForBankSchedule).mockReturnValue(mockReportPeriod);
      sendEmailSpy = jest.fn(() => Promise.resolve({}));
      jest.mocked(getAllBanks).mockResolvedValue(banks);
      externalApi.sendEmail = sendEmailSpy;
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('does not try to create any utilisation reports when there are no banks', async () => {
      // Arrange
      jest.mocked(getAllBanks).mockResolvedValue([]);

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(saveUtilisationReportSpy).not.toHaveBeenCalled();
    });

    it('does not try to create any utilisation reports when reports for all banks in the current period already exist', async () => {
      // Arrange
      jest.mocked(getAllBanks).mockResolvedValue([mockBank]);

      const existingReport = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED).withBankId(mockBank.id).build();
      findOneByBankIdAndReportPeriodSpy.mockResolvedValue(existingReport);

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledTimes(1);
      expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledWith(mockBank.id, mockReportPeriod);
      expect(saveUtilisationReportSpy).not.toHaveBeenCalled();
    });

    it('does not try to create reports when the bank is not visible in TFM utilisation reports', async () => {
      // Arrange
      const bankNotVisible = { id: '1', name: 'Bank 1', isVisibleInTfmUtilisationReports: false } as Bank;
      jest.mocked(getAllBanks).mockResolvedValue([bankNotVisible]);

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(findOneByBankIdAndReportPeriodSpy).not.toHaveBeenCalled();
      expect(saveUtilisationReportSpy).not.toHaveBeenCalled();
    });

    it('tries to create utilisation reports for all banks when reports for all banks in the current period do not exist', async () => {
      // Arrange
      findOneByBankIdAndReportPeriodSpy.mockResolvedValue(null);

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledTimes(banks.length);
      banks.forEach(({ id }) => expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledWith(id, mockReportPeriod));
      expect(saveUtilisationReportSpy).toHaveBeenCalledTimes(banks.length);

      banks.forEach((bank) => {
        const newReport = UtilisationReportEntity.createNotReceived({
          bankId: bank.id,
          reportPeriod: mockReportPeriod,
          requestSource: {
            platform: REQUEST_PLATFORM_TYPE.SYSTEM,
          },
        });
        expect(saveUtilisationReportSpy).toHaveBeenCalledWith(newReport);
      });
    });

    it('only tries to create reports for banks which do not have a report for the current report period', async () => {
      // Arrange
      const bankWithoutReport = banks[0];

      const existingReport = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED).build();
      findOneByBankIdAndReportPeriodSpy.mockImplementation((bankId: string) => {
        switch (bankId) {
          case bankWithoutReport.id:
            return Promise.resolve(null);
          default:
            return Promise.resolve(existingReport);
        }
      });

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledTimes(banks.length);
      banks.forEach(({ id }) => expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledWith(id, mockReportPeriod));
      expect(saveUtilisationReportSpy).toHaveBeenCalledTimes(1);

      const newReportForBankWithoutReport = UtilisationReportEntity.createNotReceived({
        bankId: bankWithoutReport.id,
        reportPeriod: mockReportPeriod,
        requestSource: {
          platform: REQUEST_PLATFORM_TYPE.SYSTEM,
        },
      });
      expect(saveUtilisationReportSpy).toHaveBeenCalledWith(newReportForBankWithoutReport);
    });
  });

  describe('when UtilisationReportRepo.save errors', () => {
    beforeEach(() => {
      jest.mocked(getAllBanks).mockResolvedValue(banks);
      sendEmailSpy = jest.fn(() => Promise.resolve({}));
      externalApi.sendEmail = sendEmailSpy;
    });

    it('should send an email', async () => {
      // Arrange
      saveUtilisationReportSpy.mockRejectedValueOnce(new Error('Test error'));

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.REPORT_INSERTION_CRON_FAILURE, UTILISATION_REPORT_CREATION_FAILURE_EMAIL_ADDRESS, {
        bank_id: banks[0].id,
      });
    });
  });
});
