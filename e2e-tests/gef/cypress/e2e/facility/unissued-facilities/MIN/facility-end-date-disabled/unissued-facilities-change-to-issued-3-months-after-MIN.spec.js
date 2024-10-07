import relative from '../../../../relativeURL';

import CONSTANTS from '../../../../../fixtures/constants';

import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';

import { MOCK_APPLICATION_MIN } from '../../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { errorSummary } from '../../../../partials';
import applicationPreview from '../../../../pages/application-preview';
import unissuedFacilityTable from '../../../../pages/unissued-facilities';
import aboutFacilityUnissued from '../../../../pages/unissued-facilities-about-facility';

let dealId;
let token;

const { unissuedCashFacility, issuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover } = multipleMockGefFacilities();

const FACILITY_THREE_SPECIAL = { ...unissuedContingentFacility };
FACILITY_THREE_SPECIAL.specialIssuePermission = true;

context('Unissued Facilities MIN - change to issued more than 3 months after MIN submission date - feature flag disabled', () => {
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          dealId = body._id;
          MOCK_APPLICATION_MIN.manualInclusionNoticeSubmissionDate = `${dateConstants.oneYearUnix}608`;
          cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_MIN).then(() => {
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacility);
            });
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, issuedCashFacility),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, FACILITY_THREE_SPECIAL),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover),
            );
            cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
          });
        });
      });
  });

  describe('Change facility to issued from application preview', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should not be able to update facility and then go back to application preview page with coverStartDate more than 3 months in the future', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.todayYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.tomorrowDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.tomorrowMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.tomorrowYear);

      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.threeYearsDay);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.threeYearsMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.threeYearsYear);

      cy.clickContinueButton();

      errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');

      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();
      cy.clickContinueButton();

      errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');
    });

    it('should be able to update facility and then go back to application preview page with coverStartDate more than 3 months in the future if specialIssuePermission', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(1).click();

      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.todayYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.tomorrowDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.tomorrowMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.tomorrowYear);

      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.threeYearsDay);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.threeYearsMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.threeYearsYear);

      cy.clickContinueButton();

      // to go back to application preview page
      unissuedFacilityTable.updateFacilitiesLater().click();
    });

    it('should not be able to update facility from application preview with coverStartDate more than 3 months in the future if specialIssuePermission', () => {
      // to change to issued from preview page by clicking change on issued row
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().click();

      cy.keyboardInput(aboutFacilityUnissued.facilityName(), `${unissuedCashFacilityWith20MonthsOfCover.name}name`);

      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.todayYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.tomorrowDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.tomorrowMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.tomorrowYear);

      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.threeYearsDay);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.threeYearsMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.threeYearsYear);
      cy.clickContinueButton();

      errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');

      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();
      cy.clickContinueButton();

      errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');
    });
  });
});