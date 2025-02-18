import { EntityManager } from 'typeorm';
import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  REQUEST_PLATFORM_TYPE,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleFeeRecordPaymentDeletedEvent } from './payment-deleted.event-handler';
import { aDbRequestSource } from '../../../../../../test-helpers';

describe('handleFeeRecordPaymentDeletedEvent', () => {
  const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  it(`sets the fee record status to ${FEE_RECORD_STATUS.MATCH} when the event payload 'feeRecordsAndPaymentsMatch' is true and 'hasAttachedPayments' is true`, async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).build();

    // Act
    await handleFeeRecordPaymentDeletedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: true,
      hasAttachedPayments: true,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.MATCH);
  });

  it(`sets the fee record status to ${FEE_RECORD_STATUS.DOES_NOT_MATCH} when the event payload 'feeRecordsAndPaymentsMatch' is false and 'hasAttachedPayments' is true`, async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.MATCH).build();

    // Act
    await handleFeeRecordPaymentDeletedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: false,
      hasAttachedPayments: true,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.DOES_NOT_MATCH);
  });

  it.each([true, false])(
    `sets the fee record status to ${FEE_RECORD_STATUS.TO_DO} when the event payload 'hasAttachedPayments' is false and 'feeRecordsAndPaymentsMatch' is %s`,
    async (feeRecordsAndPaymentsMatch: boolean) => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.MATCH).build();

      // Act
      await handleFeeRecordPaymentDeletedEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        feeRecordsAndPaymentsMatch,
        hasAttachedPayments: false,
        requestSource: aDbRequestSource(),
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.TO_DO);
    },
  );

  it('updates the last updated by fields to the request source', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .withLastUpdatedByIsSystemUser(true)
      .withLastUpdatedByPortalUserId(null)
      .withLastUpdatedByTfmUserId(null)
      .build();

    // Act
    await handleFeeRecordPaymentDeletedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: false,
      hasAttachedPayments: false,
      requestSource: {
        platform: REQUEST_PLATFORM_TYPE.TFM,
        userId: '123',
      },
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
    expect(feeRecord.lastUpdatedByTfmUserId).toEqual('123');
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });
});
