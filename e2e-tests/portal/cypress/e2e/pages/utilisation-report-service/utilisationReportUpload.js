const page = {
  utilisationReportFileInput: () => cy.get('[data-cy="utilisation-report-file-upload"]'),
  utilisationReportFileInputErrorMessage: () => cy.get('[data-cy="utilisation-report-file-upload-error-message"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  checkReportTitle: () => cy.get('[data-cy="check-the-report-title"]'),
  validationErrorTable: () => cy.get('[data-cy="validation-errors-table"]'),
  validationErrorTableRows: () => cy.get('[data-cy="validation-errors-table-row"]'),
  currentUrl: () => cy.url(),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
};

module.exports = page;