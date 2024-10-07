import { format } from 'date-fns';

import relative from '../../../../relativeURL';

import CONSTANTS from '../../../../../fixtures/constants';

import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';

import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { continueButton, errorSummary, mainHeading } from '../../../../partials';
import applicationPreview from '../../../../pages/application-preview';
import unissuedFacilityTable from '../../../../pages/unissued-facilities';
import aboutFacilityUnissued from '../../../../pages/unissued-facilities-about-facility';
import applicationSubmission from '../../../../pages/application-submission';
import statusBanner from '../../../../pages/application-status-banner';

const { unissuedCashFacility, issuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover } = multipleMockGefFacilities();

let dealId;
let token;
let facilityOneId;

const unissuedFacilitiesArray = [unissuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover];

context('Unissued Facilities AIN - change all to issued from unissued table - feature flag disabled', () => {
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        // creates application and inserts facilities and changes status
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          dealId = body._id;
          cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_AIN).then(() => {
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
              facilityOneId = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacility);
            });
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, issuedCashFacility),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedContingentFacility),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover),
            );
            cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
          });
        });
      });
  });

  describe('Change facility to issued from unissued table', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    // ensures the task comment box exists with correct headers and link
    it('task comment box exists with correct header and unissued facilities link', () => {
      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      applicationPreview.submitButtonPostApproval().should('not.exist');
      mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
      applicationPreview.automaticCoverSummaryList().contains('Yes - submit as an automatic inclusion notice');
      applicationPreview.automaticCoverCriteria().should('exist');
    });

    /* application preview should not have unlocked ability to change unissued facilities until
       at least 1 changed from unissued table
    */
    it('facilities table does not contain any add or change links as have not changed any facilities to issued yet', () => {
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(unissuedCashFacilityWith20MonthsOfCover.name);
      applicationPreview.facilitySummaryListTable(0).nameAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(0).issueDateAction().should('not.exist');

      applicationPreview.facilitySummaryListTable(0).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
    });

    it('clicking unissued facilities link takes you to unissued facility list page', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
      unissuedFacilityTable.updateFacilitiesLater().contains('Update facility stage later');
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
      unissuedFacilityTable.rows().contains(format(dateConstants.threeDaysAgoPlusMonth, 'dd MMM yyyy'));
      statusBanner.applicationBanner().should('exist');
    });

    it('clicking back or update later takes you back to application preview', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));

      applicationPreview.unissuedFacilitiesReviewLink().click();
      // ensures that nothing has changed
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });

    // clicking update on unissued-facilities table
    it('clicking on update should take you to the update facility page with correct url', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/about`));
    });

    it('update facility page should have correct titles and text', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      mainHeading().contains("Tell us you've issued this facility");
      aboutFacilityUnissued.facilityNameLabel().contains('Name for this cash facility');
      aboutFacilityUnissued.facilityName().should('have.value', unissuedCashFacility.name);

      aboutFacilityUnissued.issueDateDay().should('have.value', '');
      aboutFacilityUnissued.issueDateMonth().should('have.value', '');
      aboutFacilityUnissued.issueDateMonth().should('have.value', '');

      aboutFacilityUnissued.coverStartDateDay().should('have.value', '');
      aboutFacilityUnissued.coverStartDateMonth().should('have.value', '');
      aboutFacilityUnissued.coverStartDateYear().should('have.value', '');

      aboutFacilityUnissued.coverEndDateDay().should('have.value', '');
      aboutFacilityUnissued.coverEndDateMonth().should('have.value', '');
      aboutFacilityUnissued.coverEndDateYear().should('have.value', '');
    });

    it('error messages should be correct when entering dates beyond validation limits', () => {
      // when entering no dates
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      cy.clickContinueButton();

      aboutFacilityUnissued.issueDateError().contains('Enter the date you issued the facility to the exporter');
      aboutFacilityUnissued.shouldCoverStartOnSubmissionError().contains('Select if you want UKEF cover to start on the day you issue the facility');
      aboutFacilityUnissued.coverEndDateError().contains('Enter a cover end date');
      errorSummary().contains('Enter the date you issued the facility to the exporter');
      errorSummary().contains('Select if you want UKEF cover to start on the day you issue the facility');
      errorSummary().contains('Enter a cover end date');

      // entering date in the past for issue date
      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.fourDaysAgoDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.fourDaysAgoMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.fourDaysAgoYear);
      cy.clickContinueButton();
      aboutFacilityUnissued.issueDateError().contains('The issue date must not be before the date of the inclusion notice submission date');
      errorSummary().contains('The issue date must not be before the date of the inclusion notice submission date');

      // entering issue date in the future
      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.tomorrowDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.tomorrowMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.tomorrowYear);
      cy.clickContinueButton();
      aboutFacilityUnissued.issueDateError().contains('The issue date cannot be in the future');
      errorSummary().contains('The issue date cannot be in the future');

      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.todayYear);

      // entering cover start date before issue date
      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.threeDaysDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.threeDaysMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.threeDaysYear);
      cy.clickContinueButton();
      aboutFacilityUnissued.coverStartDateError().contains('Cover start date cannot be before the issue date');
      errorSummary().contains('Cover start date cannot be before the issue date');

      // entering cover start date beyond 3 months from notice date
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.threeMonthsOneDayDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.threeMonthsOneDayMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.threeMonthsOneDayYear);
      cy.clickContinueButton();
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');

      // coverEnd date before coverStartDate
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.twoMonthsDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.twoMonthsMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.twoMonthsYear);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.twentyEightDay);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.twentyEightMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.twentyEightYear);
      cy.clickContinueButton();
      errorSummary().contains('Cover end date cannot be before cover start date');

      // coverEnd date same as coverStartDate
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.todayYear);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.todayYear);
      cy.clickContinueButton();
      errorSummary().contains('The cover end date must be after the cover start date');

      cy.keyboardInput(aboutFacilityUnissued.issueDateDay().clear(), '**');
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth().clear(), `${dateConstants.threeDaysMonth}-`);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear().clear(), `${dateConstants.threeDaysYear}2`);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay().clear(), `${dateConstants.twoMonthsDay}/`);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth().clear(), `${dateConstants.twoMonthsMonth}2`);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear().clear(), `${dateConstants.twoMonthsYear}/`);

      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay().clear(), `${dateConstants.threeMonthsOneDayDay}2`);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth().clear(), `${dateConstants.threeMonthsOneDayMonth}-`);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear().clear(), `${dateConstants.threeMonthsOneDayYear}2`);
      cy.clickContinueButton();

      errorSummary().contains('The day for the issue date must include 1 or 2 numbers');
      errorSummary().contains('The month for the issue date must include 1 or 2 numbers');
      errorSummary().contains('The year for the issue date must include 4 numbers');
      errorSummary().contains('The day for the cover start date must include 1 or 2 numbers');
      errorSummary().contains('The month for the cover start date must include 1 or 2 numbers');
      errorSummary().contains('The year for the cover start date must include 4 numbers');
      errorSummary().contains('The day for the cover end date must include 1 or 2 numbers');
      errorSummary().contains('The month for the cover end date must include 1 or 2 numbers');
      errorSummary().contains('The year for the cover end date must include 4 numbers');
      aboutFacilityUnissued.issueDateError().contains('The year for the issue date must include 4 numbers');
      aboutFacilityUnissued.coverStartDateError().contains('The year for the cover start date must include 4 numbers');
      aboutFacilityUnissued.coverEndDateError().contains('The year for the cover end date must include 4 numbers');
    });

    it('the correct success messages should be displayed after changing facility to issued', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.threeDaysDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.threeDaysMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.threeDaysYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.threeDaysDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.threeDaysMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.threeDaysYear);

      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.threeMonthsOneDayDay);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.threeMonthsOneDayMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.threeMonthsOneDayYear);

      cy.clickContinueButton();

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[0].name} is updated`);
      // checks the facility has been removed from unissued list
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 1);
      // should not be able to continue until all facilities issued - instead use update later to go to preview
      continueButton().should('not.exist');

      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.todayYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.twoMonthsDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.twoMonthsMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.twoMonthsYear);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.threeMonthsOneDayDay);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.threeMonthsOneDayMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.threeMonthsOneDayYear);

      cy.clickContinueButton();

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[1].name} is updated`);
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 2);
      continueButton().should('not.exist');

      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.todayYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.twoMonthsDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.twoMonthsMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.twoMonthsYear);

      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.threeMonthsOneDayDay);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.threeMonthsOneDayMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.threeMonthsOneDayYear);

      cy.clickContinueButton();

      unissuedFacilityTable.rows().should('have.length', 0);
      unissuedFacilityTable.allUnissuedUpdatedSuccess().contains('Facility stages are now updated');
      continueButton().should('exist');
      // exists since all unissued updated from table
      cy.clickContinueButton();
    });

    // task comments box should show facilities names have changed to unissued
    it('preview review facility stage has correct headers and shows all 3 updated facilities and submit button should be visible', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
      applicationPreview.unissuedFacilitiesReviewLink().should('not.exist');
      applicationPreview.submitButtonPostApproval().should('exist');
    });

    /* should be able to change dates on facility that has changed to issued */
    it('facility table should have change links on the changed to issued facilities', () => {
      // to check date format
      const issuedDate = format(dateConstants.today, 'd MMMM yyyy');
      const coverStart = format(dateConstants.twoMonths, 'd MMMM yyyy');
      const coverEnd = format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy');

      // should be able to change facility four as changed to issued
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(unissuedCashFacilityWith20MonthsOfCover.name);
      applicationPreview.facilitySummaryListTable(0).nameAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedValue().contains('Issued');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).issueDateValue().contains(issuedDate);
      applicationPreview.facilitySummaryListTable(0).issueDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).coverStartDateValue().contains(coverStart);
      applicationPreview.facilitySummaryListTable(0).coverStartDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).coverEndDateValue().contains(coverEnd);
      applicationPreview.facilitySummaryListTable(0).coverEndDateAction().contains('Change');

      // should not be able to change facility two has previously issued (not changed from unissued to issued)
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(issuedCashFacility.name);
      applicationPreview.facilitySummaryListTable(2).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedValue().contains('Issued');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).issueDateAction().should('not.exist');
      applicationPreview.facilitySummaryListTable(2).coverStartDateValue().contains('Date you submit the notice');
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().should('have.class', 'govuk-!-display-none');
    });

    // checks that can edit changed facility
    it('clicking change should take you to about facility page with different url', () => {
      const issuedDate = format(dateConstants.threeDaysAgo, 'd MMMM yyyy');
      const coverStart = format(dateConstants.threeDaysAgo, 'd MMMM yyyy');

      // should be able to change number 1 as changed to issued
      applicationPreview.facilitySummaryListTable(3).nameValue().contains(unissuedCashFacility.name);
      applicationPreview.facilitySummaryListTable(3).issueDateValue().contains(issuedDate);
      applicationPreview.facilitySummaryListTable(3).nameAction().contains('Change');
      applicationPreview.facilitySummaryListTable(3).coverStartDateValue().contains(coverStart);
      applicationPreview.facilitySummaryListTable(3).nameAction().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change`));

      // checks that cancel does not save changes
      cy.keyboardInput(aboutFacilityUnissued.facilityName(), 'a new name');
      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();
      cy.clickCancelLink();

      applicationPreview.facilitySummaryListTable(3).nameValue().contains(unissuedCashFacility.name);
      applicationPreview.facilitySummaryListTable(3).nameAction().contains('Change');
      applicationPreview.facilitySummaryListTable(3).nameAction().click();

      cy.keyboardInput(aboutFacilityUnissued.facilityName(), `${unissuedCashFacility.name}name`);
      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();

      cy.clickContinueButton();

      // checks that name has been updated
      applicationPreview.facilitySummaryListTable(3).nameValue().contains(`${unissuedCashFacility.name}name`);
      applicationPreview.facilitySummaryListTable(3).issueDateValue().contains(issuedDate);
    });

    // checks that can submit application to checker with changed facilities
    it('pressing submit button takes you to submit page and with correct panel once submitted to checker', () => {
      applicationPreview.submitButtonPostApproval().click();
      applicationSubmission.submissionText().contains('Someone at your bank must check your update before they can submit it to UKEF');
      cy.clickSubmitButton();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit`));
      applicationSubmission.confirmationPanelTitleFacilities().contains('Issued facilities submitted for checking at your bank');
    });
  });
});