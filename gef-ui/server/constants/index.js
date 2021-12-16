const DEAL_SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
};

const DEAL_STATUS = {
  // these statuses can be either on the top level
  // or in a child object, not specific to the entire deal.
  DRAFT: 'Draft',
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',

  // statuses specific to the entire deal
  BANK_CHECK: 'Ready for Checker\'s approval',
  CHANGES_REQUIRED: 'Further Maker\'s input required',
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged by UKEF',
  UKEF_IN_PROGRESS: 'In progress by UKEF',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted (without conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};

const FACILITY_TYPE = {
  CASH: 'CASH',
  CONTINGENT: 'CONTINGENT',
};

const SME_TYPE = {
  MICRO: 'Micro',
  SMALL: 'Small',
  MEDIUM: 'Medium',
  NOT_SME: 'Not an SME',
};

const BOOLEAN = {
  YES: 'Yes',
  NO: 'No',
};

const STAGE = {
  ISSUED: 'Issued',
  UNISSUED: 'Unissued',
};

const FACILITY_PROVIDED_DETAILS = {
  TERM: 'Term basis',
  RESOLVING: 'Revolving or renewing basis',
  COMMITTED: 'Committed basis',
  UNCOMMITTED: 'Uncommitted basis',
  ON_DEMAND: 'On demand or overdraft basis',
  FACTORING: 'Factoring on a  with-recourse basis',
  OTHER: 'Other',
};

const FACILITY_PAYMENT_TYPE = {
  IN_ADVANCE: 'IN_ADVANCE',
  IN_ARREARS: 'IN_ARREARS',
  AT_MATURITY: 'AT_MATURITY',
};

const AUTHORISATION_LEVEL = {
  READ: 'READ',
  COMMENT: 'COMMENT',
  EDIT: 'EDIT',
  CHANGE_STATUS: 'CHANGE_STATUS',
};

const DEFAULT_COUNTRY = 'United Kingdom';

const DATE_FORMAT = {
  COVER: 'MMMM d, yyyy',
};

module.exports = {
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  FACILITY_TYPE,
  SME_TYPE,
  BOOLEAN,
  STAGE,
  FACILITY_PROVIDED_DETAILS,
  FACILITY_PAYMENT_TYPE,
  AUTHORISATION_LEVEL,
  DEFAULT_COUNTRY,
  DATE_FORMAT,
};