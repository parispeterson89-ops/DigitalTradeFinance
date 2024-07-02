import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type PaymentAddedEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsAndPaymentsMatch: boolean;
  requestSource: DbRequestSource;
};

export type FeeRecordPaymentAddedEvent = BaseFeeRecordEvent<'PAYMENT_ADDED', PaymentAddedEventPayload>;

export const handleFeeRecordPaymentAddedEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, feeRecordsAndPaymentsMatch, requestSource }: PaymentAddedEventPayload,
): Promise<FeeRecordEntity> => {
  const status: FeeRecordStatus = feeRecordsAndPaymentsMatch ? 'MATCH' : 'DOES_NOT_MATCH';
  feeRecord.updateWithStatus({ status, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};