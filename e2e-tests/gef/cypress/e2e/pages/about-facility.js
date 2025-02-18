const aboutFacility = {
  facilityName: () => cy.get('[data-cy="facility-name"]'),
  facilityNameLabel: () => cy.get('[data-cy="facility-name-label"]'),
  facilityNameError: () => cy.get('[data-cy="facility-name-error"]'),
  coverStartDate: () => cy.get('[data-cy="cover-start-date"]'),
  coverStartDateError: () => cy.get('[data-cy="cover-start-date-error"]'),
  coverStartDateDay: () => cy.get('[data-cy="cover-start-date-day"]'),
  coverStartDateMonth: () => cy.get('[data-cy="cover-start-date-month"]'),
  coverStartDateYear: () => cy.get('[data-cy="cover-start-date-year"]'),
  shouldCoverStartOnSubmissionError: () => cy.get('[data-cy="should-cover-start-on-submission-error"]'),
  shouldCoverStartOnSubmissionYes: () => cy.get('[data-cy="should-cover-start-on-submission-yes"]'),
  shouldCoverStartOnSubmissionNo: () => cy.get('[data-cy="should-cover-start-on-submission-no"]'),
  coverEndDateError: () => cy.get('[data-cy="cover-end-date-error"]'),
  coverEndDateDay: () => cy.get('[data-cy="cover-end-date-day"]'),
  coverEndDateMonth: () => cy.get('[data-cy="cover-end-date-month"]'),
  coverEndDateYear: () => cy.get('[data-cy="cover-end-date-year"]'),
  monthsOfCover: () => cy.get('[data-cy="months-of-cover"]'),
  monthsOfCoverError: () => cy.get('[data-cy="months-of-cover-error"]'),
  isUsingFacilityEndDateError: () => cy.get('[data-cy="is-using-facility-end-date-error"]'),
  isUsingFacilityEndDateYes: () => cy.get('[data-cy="is-using-facility-end-date-yes"]'),
  isUsingFacilityEndDateNo: () => cy.get('[data-cy="is-using-facility-end-date-no"]'),
};

export default aboutFacility;
