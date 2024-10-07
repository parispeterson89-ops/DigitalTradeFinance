import relative from '../../../relativeURL';
import { backLink, headingCaption, continueButton, errorSummary, saveAndReturnButton } from '../../../partials';
import facilityEndDate from '../../../pages/facility-end-date';
import aboutFacility from '../../../pages/about-facility';
import {
  tomorrowDay,
  tomorrowMonth,
  tomorrowYear,
  todayDay,
  todayMonth,
  todayYear,
  yesterdayDay,
  yesterdayMonth,
  yesterdayYear,
} from '../../../../../../e2e-fixtures/dateConstants';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';

const applications = [];
let token;

const now = new Date();
const nextYear = Number(todayYear) + 1;

context('Facility End Date Page - feature flag enabled', () => {
  let application;
  let facilityId;

  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllGefApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          cy.apiFetchAllFacilities(item._id, token).then((res) => {
            applications.push({
              id: item._id,
              facilities: res.body.items.filter((it) => it.details.dealId === item._id),
            });
          });
        });
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    application = applications[1];
    facilityId = application.facilities[0].details._id;

    cy.saveSession();
  });

  it('displays the correct elements', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));

    aboutFacility.isUsingFacilityEndDateYes().click();
    cy.clickSaveAndReturnButton();

    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    backLink();
    headingCaption();
    facilityEndDate.facilityEndDateDay();
    facilityEndDate.facilityEndDateMonth();
    facilityEndDate.facilityEndDateYear();
    facilityEndDate.facilityEndDateDetails();
    continueButton();
    saveAndReturnButton();
  });

  it('redirects the user to `About this facility` page when clicking on back link', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.clickBackLink();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
  });

  it('validates the form when clicking on Continue', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.clickContinueButton();
    errorSummary();
    facilityEndDate.facilityEndDateError();
  });

  it('redirects user to application page when clicking on `save and return` button', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));
    cy.clickSaveAndReturnButton();
    cy.url().should('eq', relative(`/gef/application-details/${application.id}`));
  });

  it('validates the form if not blank when clicking on `save and return` button', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), todayDay);
    facilityEndDate.facilityEndDateMonth().clear();
    cy.clickSaveAndReturnButton();
    errorSummary();
    facilityEndDate.facilityEndDateError();
  });

  it('redirects user to application page when clicking on `save and return` button and form has been successfully filled in', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), todayDay);
    cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), todayMonth);
    cy.keyboardInput(facilityEndDate.facilityEndDateYear(), nextYear);

    cy.clickSaveAndReturnButton();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}`));
  });

  it('when cover start date is given, it validates facility end date is after the cover start date', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
    cy.keyboardInput(aboutFacility.facilityName(), 'Name');
    aboutFacility.shouldCoverStartOnSubmissionNo().click();
    cy.keyboardInput(aboutFacility.coverStartDateDay(), tomorrowDay);
    cy.keyboardInput(aboutFacility.coverStartDateMonth(), tomorrowMonth);
    cy.keyboardInput(aboutFacility.coverStartDateYear(), tomorrowYear);
    cy.keyboardInput(aboutFacility.coverEndDateDay(), todayDay);
    cy.keyboardInput(aboutFacility.coverEndDateMonth(), todayMonth);
    cy.keyboardInput(aboutFacility.coverEndDateYear(), nextYear);
    aboutFacility.isUsingFacilityEndDateYes().click();

    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), todayDay);
    cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), todayMonth);
    cy.keyboardInput(facilityEndDate.facilityEndDateYear(), todayYear);

    cy.clickContinueButton();
    errorSummary();
    facilityEndDate.facilityEndDateError();

    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), tomorrowDay);
    cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), tomorrowMonth);
    cy.keyboardInput(facilityEndDate.facilityEndDateYear(), tomorrowYear);

    cy.clickContinueButton();
    errorSummary().should('not.exist');
  });

  it('when cover start date is not given, it validates facility end date is after today', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
    cy.keyboardInput(aboutFacility.facilityName(), 'Name');
    aboutFacility.shouldCoverStartOnSubmissionYes().click();
    cy.keyboardInput(aboutFacility.coverEndDateDay(), todayDay);
    cy.keyboardInput(aboutFacility.coverEndDateMonth(), todayMonth);
    cy.keyboardInput(aboutFacility.coverEndDateYear(), nextYear);
    aboutFacility.isUsingFacilityEndDateYes().click();

    cy.clickContinueButton();
    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), yesterdayDay);
    cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), yesterdayMonth);
    cy.keyboardInput(facilityEndDate.facilityEndDateYear(), yesterdayYear);

    cy.clickContinueButton();
    errorSummary();
    facilityEndDate.facilityEndDateError();

    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), todayDay);
    cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), todayMonth);
    cy.keyboardInput(facilityEndDate.facilityEndDateYear(), todayYear);

    cy.clickContinueButton();
    errorSummary().should('not.exist');
  });

  it('validates facility end date is less than 6 years in the future', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), now.getDate() + 1);

    cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), now.getMonth() + 1);

    cy.keyboardInput(facilityEndDate.facilityEndDateYear(), now.getFullYear() + 7);

    cy.clickContinueButton();
    errorSummary();
    facilityEndDate.facilityEndDateError();
  });

  it('redirects the user to `provided facility` page when form has been successfully filled in', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), todayDay);
    cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), todayMonth);
    cy.keyboardInput(facilityEndDate.facilityEndDateYear(), nextYear);

    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/provided-facility`));
  });

  it('stores the inputted values', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), todayDay);
    cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), todayMonth);
    cy.keyboardInput(facilityEndDate.facilityEndDateYear(), nextYear);

    cy.clickContinueButton();

    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));
    facilityEndDate.facilityEndDateDay().should('have.value', now.getDate());
    facilityEndDate.facilityEndDateMonth().should('have.value', now.getMonth() + 1);
    facilityEndDate.facilityEndDateYear().should('have.value', now.getFullYear() + 1);
  });

  it('redirects to the Application Details page when not using facility end date ', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
    cy.keyboardInput(aboutFacility.facilityName(), 'Name');
    aboutFacility.shouldCoverStartOnSubmissionYes().click();
    cy.keyboardInput(aboutFacility.coverEndDateDay(), todayDay);
    cy.keyboardInput(aboutFacility.coverEndDateMonth(), todayMonth);
    cy.keyboardInput(aboutFacility.coverEndDateYear(), nextYear);
    aboutFacility.isUsingFacilityEndDateNo().click();
    cy.clickContinueButton();

    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
  });
});