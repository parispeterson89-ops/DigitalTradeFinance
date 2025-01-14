import { EntityManager, In } from 'typeorm';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { Currency, FEE_RECORD_STATUS, FeeRecordEntity, FeeRecordStatus, UtilisationReportEntity } from '@ukef/dtfs2-common';

export const FeeRecordRepo = SqlDbDataSource.getRepository(FeeRecordEntity).extend({
  /**
   * Finds all fee record entities linked to a report
   * @param report - A utilisation report
   * @returns The found fee record entities
   */
  async findByReport(report: UtilisationReportEntity): Promise<FeeRecordEntity[]> {
    return await this.findBy({ report });
  },

  /**
   * Finds one fee record with the supplied id and report id with the report attached
   * @param id - The fee record id
   * @param reportId - The report id of the report attached to the fee record
   * @returns The found fee record with the report attached
   */
  async findOneByIdAndReportIdWithReport(id: number, reportId: number): Promise<FeeRecordEntity | null> {
    return await this.findOne({
      where: {
        id,
        report: { id: reportId },
      },
      relations: { report: true },
    });
  },

  /**
   * Finds fee record entities attached to a report with the
   * supplied id which match the supplied statuses with the
   * report attached
   * @param reportId - The report id of the report attached to the fee records
   * @param statuses - The fee record statuses to search by
   * @returns The found fee record entities
   */
  async findByReportIdAndStatusesWithReportAndPayments(reportId: number, statuses: FeeRecordStatus[]): Promise<FeeRecordEntity[]> {
    return await this.find({
      where: {
        report: { id: reportId },
        status: In(statuses),
      },
      relations: { report: true, payments: true },
    });
  },

  /**
   * Finds fee record entities attached to a report with the
   * supplied id which match the supplied statuses
   * @param reportId - The report id of the report attached to the fee records
   * @param statuses - The fee record statuses to search by
   * @returns The found fee record entities
   */
  async findByReportIdAndStatuses(reportId: number, statuses: FeeRecordStatus[]): Promise<FeeRecordEntity[]> {
    return await this.find({
      where: {
        report: { id: reportId },
        status: In(statuses),
      },
      relations: { report: false, payments: false },
    });
  },

  /**
   * Finds fee record entities with supplied ids attached to a report with the
   * supplied report id with the report attached
   * @param ids - The fee record ids to search by
   * @param reportId - The report id of the report attached to the fee records
   * @returns The found fee record entities
   */
  async findByIdAndReportIdWithReport(ids: number[], reportId: number): Promise<FeeRecordEntity[]> {
    return await this.find({
      where: {
        id: In(ids),
        report: { id: reportId },
      },
      relations: { report: true },
    });
  },

  /**
   * Finds fee record entities with supplied ids, with the payments and their
   * fee records attached.
   * @param ids - The fee record ids to search by
   * @returns The found fee record entities with their associated payments and
   * their fee records
   */
  async findByIdWithPaymentsAndFeeRecords(ids: number[]): Promise<FeeRecordEntity[]> {
    return await this.find({
      where: {
        id: In(ids),
      },
      relations: { payments: { feeRecords: true } },
    });
  },

  /**
   * Finds fee record entities with status 'DOES_NOT_MATCH' for a given report
   * and payment currency, with the payments attached.
   * @param reportId - The report id of the report attached to the fee records
   * @param paymentCurrency - The payment currency to search by
   * @returns The found fee record entities with their associated payments
   */
  async findByReportIdAndPaymentCurrencyAndStatusDoesNotMatchWithPayments(reportId: number, paymentCurrency: Currency): Promise<FeeRecordEntity[]> {
    return await this.find({
      where: {
        report: { id: reportId },
        status: FEE_RECORD_STATUS.DOES_NOT_MATCH,
        paymentCurrency,
      },
      relations: { payments: true },
    });
  },

  /**
   * Checks if a fee record exists with the supplied id and report id
   * @param id - The fee record id
   * @param reportId - The report id
   * @returns True if a matching fee record exists, false otherwise
   */
  async existsByIdAndReportId(id: number, reportId: number): Promise<boolean> {
    return await this.exists({
      where: {
        id,
        report: { id: reportId },
      },
    });
  },

  withTransaction(transactionEntityManager: EntityManager) {
    const transactionRepository = transactionEntityManager.getRepository(FeeRecordEntity);

    return {
      findOneByIdAndReportIdWithReport: this.findOneByIdAndReportIdWithReport.bind(transactionRepository),
    };
  },
});
