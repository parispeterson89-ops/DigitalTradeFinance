import { DbRequestSourceParam } from '../helpers';
import { Currency, FeeRecordStatus } from '../../types';
import { UtilisationReportEntity } from '../utilisation-report';

export type CreateFeeRecordParams = DbRequestSourceParam & {
  facilityId: string;
  exporter: string;
  baseCurrency: Currency;
  facilityUtilisation: number;
  totalFeesAccruedForThePeriod: number;
  totalFeesAccruedForThePeriodCurrency: Currency;
  totalFeesAccruedForThePeriodExchangeRate: number;
  feesPaidToUkefForThePeriod: number;
  feesPaidToUkefForThePeriodCurrency: Currency;
  paymentCurrency: Currency;
  paymentExchangeRate: number;
  status: FeeRecordStatus;
  report: UtilisationReportEntity;
};