const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');
const {
  BSS_DEAL_MIA,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals filters - filter by submissionType/noticeType', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneDeal(BSS_DEAL_MIA, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('MIA', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboard.filters.showHideButton().click();

      // apply filter
      dashboard.filters.panel.form.submissionType.MIA.checkbox().click();
      dashboard.filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboard.filters.showHideButton().click();

      dashboard.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      dashboard.filters.panel.selectedFilters.container().should('be.visible');
      dashboard.filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = dashboard.filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Notice Type');

      const firstAppliedFilter = dashboard.filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      dashboard.filters.mainContainer.selectedFilters.noticeMIA().should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
      dashboard.filters.mainContainer.selectedFilters.noticeMIA().contains(expectedText);
    });

    it('renders only MIA deals', () => {
      const ALL_MIA_DEALS = ALL_DEALS.filter(({ submissionType }) => submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
      dashboard.rows().should('have.length', ALL_MIA_DEALS.length);

      const firstMiaDeal = ALL_MIA_DEALS[0];

      dashboard.row.type(firstMiaDeal._id).should('have.text', CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
    });
  });
});