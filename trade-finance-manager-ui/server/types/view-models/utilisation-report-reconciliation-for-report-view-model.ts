import { CurrencyAndAmountString, FeeRecordStatus, SessionBank } from '@ukef/dtfs2-common';
import { PrimaryNavigationKey } from '../primary-navigation-key';
import { TfmSessionUser } from '../tfm-session-user';
import { ErrorSummaryViewModel } from './error-summary-view-model';
import { PremiumPaymentsTableCheckboxId } from '../premium-payments-table-checkbox-id';

export type SortedAndFormattedCurrencyAndAmount = {
  formattedCurrencyAndAmount: CurrencyAndAmountString | undefined;
  dataSortValue: number;
};

export type FeeRecordDisplayStatus = 'TO DO' | 'MATCH' | 'DOES NOT MATCH' | 'READY TO KEY' | 'RECONCILED';

export type FeeRecordViewModelItem = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFees: SortedAndFormattedCurrencyAndAmount;
  reportedPayments: SortedAndFormattedCurrencyAndAmount;
  totalReportedPayments: SortedAndFormattedCurrencyAndAmount;
  paymentsReceived: SortedAndFormattedCurrencyAndAmount;
  totalPaymentsReceived: SortedAndFormattedCurrencyAndAmount;
  status: FeeRecordStatus;
  displayStatus: FeeRecordDisplayStatus;
  checkboxId: PremiumPaymentsTableCheckboxId;
  isChecked: boolean;
};

export type UtilisationReportReconciliationForReportViewModel = {
  user: TfmSessionUser;
  activePrimaryNavigation: PrimaryNavigationKey;
  bank: SessionBank;
  formattedReportPeriod: string;
  reportId: number;
  feeRecords: FeeRecordViewModelItem[];
  errorSummary: [ErrorSummaryViewModel] | undefined;
};