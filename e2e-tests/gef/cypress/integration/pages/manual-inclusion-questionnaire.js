/* eslint-disable no-undef */
const manualInclusion = {
  url: (id) => `/gef/application-details/${id}/supporting-information/manual-inclusion-questionnaire`,

  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),

  templateLink: () => cy.get('[data-cy="template-link"]'),
  fileUploadComponent: () => cy.get('[data-cy="file-upload-component"]'),

  continueButton: () => cy.get('[data-cy="continue-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),

  errorSummary: () => cy.get('[data-cy="error-summary"]'),

  uploadSuccess: (fileName) => cy.get('.moj-multi-file-upload__success').contains(fileName),
  uploadFailure: (fileName) => cy.get('.moj-multi-file-upload__error').contains(fileName),
};

export default manualInclusion;